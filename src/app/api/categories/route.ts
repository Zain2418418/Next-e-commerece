import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

// 1. GET ALL CATEGORIES
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. CREATE A NEW CATEGORY
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ success: false, error: 'Category already exists' }, { status: 400 });
    }

    const newCategory = await Category.create({ name, slug });
    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}