import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order'; // Aap ka Order Mongoose Model

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { items, customerName, customerEmail, phone, shippingAddress, billingAddress, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // New Order create karte waqt lowercase 'pending' ya 'unpaid' dein
    const newOrder = await Order.create({
      customerName,
      customerEmail,
      phone,
      items,
      shippingAddress,
      billingAddress,
      totalAmount,
      paymentMethod: 'COD',
      paymentStatus: 'pending', // 👈 'Pending' (Capital P) ki jagah lowercase 'pending'
      orderStatus: 'Processing', // ya 'Pending' jo bhi aap ke orderStatus Schema mein enum allowed ho
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('COD Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place COD order' }, { status: 500 });
  }
}