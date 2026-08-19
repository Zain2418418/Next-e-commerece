import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

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

// GET: Fetch User Notifications
export async function GET(req: Request) {
  try {
    await dbconnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const query = userId ? { $or: [{ userId }, { userId: null }] } : { userId: null };
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Create notification & trigger dispatch
export async function POST(req: Request) {
  try {
    await dbconnect();
    const { title, message, type, userId } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, message: "Title & message required" }, { status: 400 });
    }

    const newNotification = await Notification.create({
      title,
      message,
      type: type || "info",
      userId: userId || null,
    });

    const tokenQuery = userId ? { userId } : {};
    const tokens = await FCMToken.find(tokenQuery);

    return NextResponse.json({
      success: true,
      notification: newNotification,
      recipients: tokens.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH: Mark Notifications as Read
export async function PATCH(req: Request) {
  try {
    await dbconnect();
    const { userId } = await req.json();

    const query = userId ? { $or: [{ userId }, { userId: null }] } : { userId: null };
    await Notification.updateMany(query, { read: true });

    return NextResponse.json({ success: true, message: "Marked all as read" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}