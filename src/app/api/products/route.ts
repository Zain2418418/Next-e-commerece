import { NextResponse } from 'next/server';
import dbconnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category'; // Ensure model file is loaded

export async function GET() {
  try {
    await dbconnect();

    // Force initialization of Category model to register schema in Mongoose
    if (Category && Category.modelName) {
      // Accessing modelName ensures the import is not tree-shaken
    }

    let products;
    try {
      // Attempt fetching with populated category
      products = await Product.find({}).populate('category').lean();
    } catch (populateError) {
      console.warn('Populate failed, fetching plain products:', populateError);
      // Fallback: Fetch products without populate if Category schema isn't bound yet
      products = await Product.find({}).lean();
    }

    return NextResponse.json(products || [], { status: 200 });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}