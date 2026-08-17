import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerName, customerEmail, phone, shippingAddress, billingAddress, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    if (!shippingAddress?.address || !shippingAddress?.city) {
      return NextResponse.json({ error: 'Delivery address and city are required' }, { status: 400 });
    }

    await dbConnect();

    // Create COD Order in MongoDB
    const newOrder = await Order.create({
      customerName,
      customerEmail,
      phone,
      items: items.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      shippingAddress,
      billingAddress,
      totalAmount: totalAmount || items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      status: 'Pending',
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('COD Order API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place COD order' }, { status: 500 });
  }
}