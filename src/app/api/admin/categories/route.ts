import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

// 1. GET: Fetch All Categories
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      categories,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch Categories Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// 2. POST: Create New Category
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, slug } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const categorySlug = slug || name.toLowerCase().trim().replace(/\s+/g, '-');

    const newCategory = await Category.create({
      name,
      slug: categorySlug,
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully!',
      category: newCategory,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create Category Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category or category already exists' },
      { status: 500 }
    );
  }
}