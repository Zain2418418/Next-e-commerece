import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbConnect";
import mongoose from "mongoose";

const fcmTokenSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const FCMToken =
  mongoose.models.FCMToken || mongoose.model("FCMToken", fcmTokenSchema);

export async function POST(req: Request) {
  try {
    await dbconnect();
    const { token, userId } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "FCM Token is required" },
        { status: 400 }
      );
    }

    // Save or update FCM Token
    await FCMToken.findOneAndUpdate(
      { token },
      { token, userId: userId || null },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { success: true, message: "Token registered successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Save FCM Token Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save token" },
      { status: 500 }
    );
  }
}