import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbConnect";
import mongoose from "mongoose";

// Simple Subscriber Schema
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);

export async function POST(req: Request) {
  try {
    await dbconnect();
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Check if already subscribed
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
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}