import { NextResponse } from "next/server";
import  dbConnect from "@/lib/dbConnect"; // 👈 Fixed: dbConnect file name
import Cart from "@/models/Cart"; // Ensure your Cart model path
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

// 🛒 1. GET: Fetch User Cart
export async function GET() {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch cart", error: error.message },
      { status: 500 }
    );
  }
}

// ➕ 2. POST: Add item to Cart / Increase Quantity
export async function POST(req: Request) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity = 1 } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product");

    return NextResponse.json(
      { success: true, message: "Item added to cart", cart },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to update cart", error: error.message },
      { status: 500 }
    );
  }
}

// 🗑️ 3. DELETE: Remove Item from Cart
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.product");

    return NextResponse.json(
      { success: true, message: "Item removed from cart", cart },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to delete item", error: error.message },
      { status: 500 }
    );
  }
}