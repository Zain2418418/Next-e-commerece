// 📁 src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import dbconnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET() {
  try {
    await dbconnect();

    // Ensures Category Schema is registered in Mongoose cache
    if (Category && Category.modelName) {
      // Prevents import tree-shaking
    }

    let products = [];
    try {
      products = await Product.find({}).populate('category').lean();
    } catch (populateError) {
      console.warn('Populate failed, falling back to plain products fetch:', populateError);
      products = await Product.find({}).lean();
    }

    // Always return safe array response
    return NextResponse.json(products || [], { status: 200 });
  } catch (error: any) {
    console.error('API Error in GET /api/products:', error?.message || error);
    
    // Return empty array with 200 status so frontend pages never crash on DB error
    return NextResponse.json([], { status: 200 });
  }
}