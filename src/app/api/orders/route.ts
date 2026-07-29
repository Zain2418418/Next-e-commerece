import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Helper function to extract user ID & Email from Auth Token Cookie
async function getUserFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return {
      userId: decoded.id || decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}

// 📦 1. GET: Fetch User Orders
export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromToken();

    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");

    // Prefer verified JWT email/userId; fallback to explicit query parameter only if unauthenticated
    const searchEmail = user?.email || queryEmail;
    const userId = user?.userId;

    if (!userId && !searchEmail) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const queryConditions: any[] = [];
    if (userId) queryConditions.push({ user: userId });
    if (searchEmail) queryConditions.push({ customerEmail: searchEmail });

    const orders = await Order.find({ $or: queryConditions })
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

// 🛒 2. POST: Place New Order (Checkout / COD)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromToken();

    const { items, shippingAddress, totalAmount, paymentMethod, customerEmail, paymentStatus } = await req.json();

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

    const isCod = (paymentMethod || "COD").toUpperCase() === "COD";

    // 1. Create Order
    const order = await Order.create({
      user: user?.userId || undefined,
      customerEmail: customerEmail || user?.email || shippingAddress?.email,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentStatus || (isCod ? "pending" : "paid"),
      status: "Pending",
    });

    // 2. Clear User Cart in DB after order is placed
    if (user?.userId) {
      await Cart.findOneAndUpdate({ user: user.userId }, { items: [] });
    }

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