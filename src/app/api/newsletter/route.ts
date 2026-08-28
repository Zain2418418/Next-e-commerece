import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbConnect";
import mongoose from "mongoose";

// Subscriber Schema
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);

// 1. GET: Fetch all subscribers for Admin Panel
export async function GET() {
  try {
    await dbconnect();
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });

    const formattedSubscribers = subscribers.map((sub) => ({
      id: sub._id.toString(),
      email: sub.email,
      subscribedAt: sub.createdAt,
    }));

    return NextResponse.json({ success: true, subscribers: formattedSubscribers }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Subscribers Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscribers." },
      { status: 500 }
    );
  }
}

// 2. POST: Handle User Subscriptions & Admin Broadcasts
export async function POST(req: Request) {
  try {
    await dbconnect();
    const body = await req.json();

    // CASE A: Admin Sending Broadcast Email
    if (body.subject && body.content) {
      const { subject, content } = body;
      const subscribers = await Subscriber.find({});
      const emails = subscribers.map((s) => s.email);

      if (emails.length === 0) {
        return NextResponse.json(
          { success: false, error: "No subscribers found to send emails." },
          { status: 400 }
        );
      }

      console.log(`Sending Email - Subject: "${subject}" to ${emails.length} subscribers.`);

      return NextResponse.json({
        success: true,
        message: `Broadcast email sent to ${emails.length} subscribers!`,
      });
    }

    // CASE B: User Subscribing to Newsletter
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Duplicate Check
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: true, message: "You are already subscribed!" },
        { status: 200 }
      );
    }

    await Subscriber.create({ email });

    return NextResponse.json(
      { success: true, message: "Thank you for subscribing to our newsletter!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

// 3. DELETE: Remove subscriber by ID
export async function DELETE(req: Request) {
  try {
    await dbconnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Subscriber ID is required." },
        { status: 400 }
      );
    }

    await Subscriber.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Subscriber removed successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Subscriber Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete subscriber." },
      { status: 500 }
    );
  }
}