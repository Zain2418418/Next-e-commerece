import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

// 1. GET: Fetch All Orders for Admin Panel
export async function GET() {
  try {
    await dbConnect();

    // Ensure models are registered in Mongoose schema cache
    if (!User) console.log('User model loaded');
    if (!Product) console.log('Product model loaded');

    // Fetch orders safely with user details populated
    const orders = await Order.find()
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'items.product',
        select: 'name price image',
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch Orders Error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// 2. PUT: Update Order Status
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { orderId, orderStatus } = await req.json();

    if (!orderId || !orderStatus) {
      return NextResponse.json(
        { success: false, error: 'Order ID and new status are required' },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order status updated successfully!',
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update Order Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}