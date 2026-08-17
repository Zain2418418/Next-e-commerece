import { NextResponse } from 'next/server';
import dbconnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET() {
  try {
    await dbconnect();

    // Ensures Category Schema is registered in Mongoose
    if (Category && Category.modelName) {
      // Prevents import tree-shaking
    }

    let products;
    try {
      products = await Product.find({}).populate('category').lean();
    } catch (populateError) {
      console.warn('Populate failed, falling back to plain products fetch:', populateError);
      products = await Product.find({}).lean();
    }

    return NextResponse.json(products || [], { status: 200 });
  } catch (error: any) {
    console.error('API Error in GET /api/products:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}