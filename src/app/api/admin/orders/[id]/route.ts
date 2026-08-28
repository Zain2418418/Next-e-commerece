import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Notification from '@/models/Notification'; // Ensure Notification model exists or handle fallback safely

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // 🔔 Issue #13 Fix: Trigger User Notification on Status Change
    if (updatedOrder.user) {
      try {
        await Notification.create({
          user: updatedOrder.user,
          title: `Order Status Updated`,
          message: `Your order #${updatedOrder._id.toString().substring(updatedOrder._id.toString().length - 8)} status has been changed to "${body.status}".`,
          type: 'order',
          read: false,
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.error('Notification creation warning:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Update Order Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}