import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Helper function to extract user ID from Auth Token Cookie
async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.id || decoded.userId;
  } catch (error) {
    return null;
  }
}

// 📦 1. GET: Fetch User Orders
export async function GET() {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch orders", error: error.message },
      { status: 500 }
    );
  }
}

// 🛒 2. POST: Place New Order (Checkout)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items, shippingAddress, totalAmount, paymentMethod } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.phone) {
      return NextResponse.json(
        { message: "Complete shipping address is required" },
        { status: 400 }
      );
    }

    // 1. Create Order
    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
    });

    // 2. Clear User Cart in DB after order is placed
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        orderId: order._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to place order", error: error.message },
      { status: 500 }
    );
  }
}