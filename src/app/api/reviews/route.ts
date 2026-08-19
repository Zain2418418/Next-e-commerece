import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbConnect";
import Review from "@/models/Review";

// 1. GET: Fetch all reviews for a specific Product
export async function GET(req: Request) {
  try {
    await dbconnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    
    // Calculate Average Rating
    const total = reviews.length;
    const avgRating = total > 0 ? (reviews.reduce((acc, item) => item.rating + acc, 0) / total).toFixed(1) : 0;

    return NextResponse.json({ success: true, reviews, avgRating: Number(avgRating), totalReviews: total });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. POST: Add a new review
export async function POST(req: Request) {
  try {
    await dbconnect();
    const { productId, userId, userName, rating, comment } = await req.json();

    if (!productId || !userId || !rating || !comment) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const newReview = await Review.create({
      productId,
      userId,
      userName: userName || "Anonymous User",
      rating: Number(rating),
      comment,
    });

    return NextResponse.json({ success: true, review: newReview, message: "Review added successfully!" }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "You have already reviewed this product." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. PUT: Edit an existing review
export async function PUT(req: Request) {
  try {
    await dbconnect();
    const { reviewId, userId, rating, comment } = await req.json();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
    }

    // Check ownership
    if (review.userId !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
    }

    review.rating = Number(rating);
    review.comment = comment;
    await review.save();

    return NextResponse.json({ success: true, review, message: "Review updated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 4. DELETE: Remove a review (User or Admin)
export async function DELETE(req: Request) {
  try {
    await dbconnect();
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json({ success: false, message: "Review ID required" }, { status: 400 });
    }

    await Review.findByIdAndDelete(reviewId);
    return NextResponse.json({ success: true, message: "Review deleted successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}