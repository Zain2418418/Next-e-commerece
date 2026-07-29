import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Retrieve session from Stripe with line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // 2. Check if order already exists for this session (prevents duplicate orders on page refresh)
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      return NextResponse.json({ success: true, order: existingOrder }, { status: 200 });
    }

    const metadata = session.metadata || {};
    let shippingAddress = {};
    try {
      shippingAddress = JSON.parse(metadata.shippingAddress || '{}');
    } catch (e) {
      // fallback
    }

    // Format items from Stripe line items
    const items = (session.line_items?.data || []).map((item: any) => ({
      name: item.description || 'Product',
      quantity: item.quantity || 1,
      price: (item.amount_total || 0) / 100 / (item.quantity || 1),
    }));

    // 3. Create Order in MongoDB
    const newOrder = await Order.create({
      user: metadata.userId && metadata.userId !== '' ? metadata.userId : undefined,
      customerEmail: session.customer_email || metadata.customerEmail || 'guest@example.com',
      items: items,
      shippingAddress: shippingAddress,
      totalAmount: (session.amount_total || 0) / 100,
      paymentMethod: 'Stripe',
      paymentStatus: 'paid',
      status: 'Pending',
      stripeSessionId: sessionId,
    });

    // 4. Clear user cart from DB if userId is present
    if (metadata.userId && metadata.userId !== '') {
      await Cart.findOneAndUpdate({ user: metadata.userId }, { items: [] });
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Success API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}