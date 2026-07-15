import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';

// 1. GET ALL PRODUCTS (With Search, Filter & Pagination)
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    
    // Query Parameters extract karein
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || Infinity;
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // 'price-asc', 'price-desc', 'rating'
    
    // Pagination settings
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Filter Query Build karein
    const query: any = {};

    // Dynamic Search (Name ya Description mein match karein)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Price Filter
    query.price = { $gte: minPrice, $lte: maxPrice };

    // Category Filter (Using Slug)
    if (categorySlug && categorySlug !== 'all') {
      const categoryObj = await Category.findOne({ slug: categorySlug });
      if (categoryObj) {
        query.category = categoryObj._id;
      } else {
        // Agar category slug valid nahi hai to khali array bhej dein
        return NextResponse.json({ success: true, data: [], total: 0 }, { status: 200 });
      }
    }

    // Sorting Option Build karein
    let sortOptions: any = {};
    if (sortBy === 'price-low') sortOptions.price = 1;
    else if (sortBy === 'price-high') sortOptions.price = -1;
    else if (sortBy === 'rating') sortOptions.rating = -1;
    else sortOptions.createdAt = -1; // Newest first (default)

    // Database Queries
    const products = await Product.find(query)
      .populate('category', 'name slug') // Category detail fetch karne k liye join operations
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page,
        pages: Math.ceil(totalProducts / limit),
        limit
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. CREATE A NEW PRODUCT
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { name, description, price, category, images, stock } = body;

    // Validation
    if (!name || !description || !price || !category || stock === undefined) {
      return NextResponse.json({ success: false, error: 'Required fields are missing.' }, { status: 400 });
    }

    // Check karein ke assign ki gayi category actual mein exist karti hai
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return NextResponse.json({ success: false, error: 'Invalid Category ID.' }, { status: 400 });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      images: images || [],
      stock,
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}