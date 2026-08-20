import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query: any = { userId: null };

    if (userId && userId !== "null" && userId !== "undefined") {
      query = {
        $or: [
          { userId: userId },
          { userId: null }
        ]
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { userId } = await req.json();

    let query: any = { userId: null };

    if (userId && userId !== "null" && userId !== "undefined") {
      query = {
        $or: [
          { userId: userId },
          { userId: null }
        ]
      };
    }

    await Notification.updateMany(query, { read: true });

    return NextResponse.json({ success: true, message: "Marked all as read" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}