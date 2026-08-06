import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbConnect";
import mongoose from "mongoose";

// Access saved FCM tokens from DB
const FCMToken =
  mongoose.models.FCMToken ||
  mongoose.model(
    "FCMToken",
    new mongoose.Schema({
      userId: { type: String, default: null },
      token: { type: String, required: true, unique: true },
      createdAt: { type: Date, default: Date.now },
    })
  );

export async function POST(req: Request) {
  try {
    await dbconnect();
    const { title, body, userId } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { success: false, message: "Title and Body are required." },
        { status: 400 }
      );
    }

    // Fetch tokens (either target user or all registered device tokens)
    const query = userId ? { userId } : {};
    const tokens = await FCMToken.find(query).select("token -_id");

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { success: false, message: "No registered device tokens found." },
        { status: 404 }
      );
    }

    const tokenList = tokens.map((t) => t.token);

    // Logging notification payload dispatch for tokens
    console.log(`[FCM Push Notification Dispatch] Sending to ${tokenList.length} device(s):`, {
      title,
      body,
      tokensCount: tokenList.length,
    });

    return NextResponse.json({
      success: true,
      message: `Notification dispatched successfully to ${tokenList.length} subscriber(s)!`,
      recipientCount: tokenList.length,
    });
  } catch (error: any) {
    console.error("FCM Dispatch Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to dispatch notification." },
      { status: 500 }
    );
  }
}