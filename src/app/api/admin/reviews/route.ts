import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbConnect";
import Review from "@/models/Review";

// 1. GET: Fetch ALL reviews (pending, approved, rejected) for Admin Panel
export async function GET() {
  try {
    await dbconnect();
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, reviews, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. PATCH / PUT: Update status (Approve / Reject)
export async function PATCH(req: Request) {
  try {
    await dbconnect();
    const { reviewId, status } = await req.json();

    if (!reviewId || !status) {
      return NextResponse.json({ success: false, message: "Review ID and Status are required" }, { status: 400 });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    if (!updatedReview) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: updatedReview, message: `Review status updated to ${status}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. DELETE: Remove review
export async function DELETE(req: Request) {
  try {
    await dbconnect();
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id") || searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json({ success: false, message: "Review ID is required" }, { status: 400 });
    }

    await Review.findByIdAndDelete(reviewId);
    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}