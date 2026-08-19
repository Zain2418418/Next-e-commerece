import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbConnect";
import Review from "@/models/Review";

// 1. GET: Fetch ONLY APPROVED reviews for Product Page
export async function GET(req: Request) {
  try {
    await dbconnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    // Fetch reviews that are APPROVED
    const reviews = await Review.find({ 
      productId, 
      status: 'approved'
    }).sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total > 0 ? (reviews.reduce((acc, item) => item.rating + acc, 0) / total).toFixed(1) : 0;

    return NextResponse.json({ 
      success: true, 
      reviews, 
      data: reviews, 
      avgRating: Number(avgRating), 
      totalReviews: total 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. POST: Add a new review
export async function POST(req: Request) {
  try {
    await dbconnect();
    const body = await req.json();
    const { productId, userId, userName, userEmail, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const newReview = await Review.create({
      productId,
      userId: userId || 'guest_user',
      userName: userName || "Anonymous User",
      userEmail: userEmail && userEmail !== '' ? userEmail : "zainulabedeen2418@gmail.com", // Fallback to active account if not provided
      rating: Number(rating),
      comment,
      status: 'pending',
    });

    return NextResponse.json({ 
      success: true, 
      review: newReview, 
      message: "Review submitted successfully! Pending approval." 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}