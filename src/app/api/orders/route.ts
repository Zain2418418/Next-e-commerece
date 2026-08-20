import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getUserFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id?: string;
      userId?: string;
      email?: string;
    };

    return {
      userId: decoded.id || decoded.userId,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromToken();

    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");

    const searchEmail = user?.email || queryEmail;
    const userId = user?.userId;

    if (!userId && !searchEmail) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const queryConditions: Record<string, unknown>[] = [];
    if (userId) queryConditions.push({ user: userId });
    if (searchEmail) queryConditions.push({ customerEmail: searchEmail });

    const orders = await Order.find({ $or: queryConditions })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { message: "Failed to fetch orders", error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromToken();

    const body = await req.json();
    const { items, shippingAddress, paymentMethod, customerEmail } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!shippingAddress?.address || !shippingAddress?.phone) {
      return NextResponse.json(
        { message: "Complete shipping address is required" },
        { status: 400 }
      );
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return NextResponse.json(
          { message: `Product not found: ${item.product}` },
          { status: 400 }
        );
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${dbProduct.name}` },
          { status: 400 }
        );
      }

      const itemPrice = dbProduct.price;
      calculatedTotal += itemPrice * item.quantity;

      validatedItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    const resolvedEmail = user?.email || customerEmail || shippingAddress?.email;
    if (!resolvedEmail) {
      return NextResponse.json(
        { message: "Customer email is required" },
        { status: 400 }
      );
    }

    const isCod = (paymentMethod || "COD").toUpperCase() === "COD";

    const order = await Order.create({
      user: user?.userId || undefined,
      customerEmail: resolvedEmail,
      items: validatedItems,
      shippingAddress,
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: isCod ? "pending" : "paid",
      status: "Pending",
    });

    // Deduct inventory
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear DB Cart
    if (user?.userId) {
      await Cart.findOneAndUpdate({ user: user.userId }, { items: [] });
    }

    // 🔔 1. CREATE NOTIFICATION FOR CUSTOMER (User Side)
    if (user?.userId) {
      await Notification.create({
        userId: user.userId,
        title: "Order Placed Successfully! 🎉",
        message: `Your order #${order._id.toString().slice(-6)} ($${calculatedTotal}) has been received.`,
        type: "order",
        read: false,
      });
    }

    // 🔔 2. CREATE NOTIFICATION FOR ADMIN (Admin Side Broadcast)
    await Notification.create({
      userId: null,
      title: "New Order Received! 🛒",
      message: `New Order #${order._id.toString().slice(-6)} placed by ${resolvedEmail} ($${calculatedTotal}).`,
      type: "order",
      read: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        orderId: order._id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      { message: "Failed to place order", error: message },
      { status: 500 }
    );
  }
}