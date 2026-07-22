import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Wishlist from "@/models/Wishlist";
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

// ❤️ 1. GET: Fetch User Wishlist
export async function GET() {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let wishlist = await Wishlist.findOne({ user: userId }).populate("products");

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    return NextResponse.json({ success: true, wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch wishlist", error: error.message },
      { status: 500 }
    );
  }
}

// 🔄 2. POST: Toggle Item in Wishlist (Add if missing, Remove if already present)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    const existsIndex = wishlist.products.findIndex(
      (id: any) => id.toString() === productId
    );

    let action = "";
    if (existsIndex > -1) {
      // Remove product if it's already in wishlist
      wishlist.products.splice(existsIndex, 1);
      action = "removed";
    } else {
      // Add product if it's not present
      wishlist.products.push(productId);
      action = "added";
    }

    await wishlist.save();
    await wishlist.populate("products");

    return NextResponse.json(
      { success: true, message: `Product ${action} in wishlist`, wishlist },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to update wishlist", error: error.message },
      { status: 500 }
    );
  }
}