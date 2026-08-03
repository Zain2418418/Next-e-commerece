import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

// 1. GET: Fetch All Products for Admin List
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch Admin Products Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// 2. POST: Create New Product
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { title, price, description, category, image, stock } = body;

    // Basic Validation
    if (!title || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, price, and category are required' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      title,
      price: Number(price),
      description,
      category,
      image,
      stock: Number(stock) || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create Product Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}