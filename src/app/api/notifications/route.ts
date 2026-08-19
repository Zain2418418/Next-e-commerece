import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Dynamic filter: user-specific notifications + global notifications
    const query = userId && userId !== "null"
      ? { $or: [{ userId }, { userId: null }] }
      : { userId: null };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { userId } = await req.json();

    const query = userId && userId !== "null"
      ? { $or: [{ userId }, { userId: null }] }
      : { userId: null };

    await Notification.updateMany(query, { read: true });

    return NextResponse.json({ success: true, message: "Marked all as read" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}