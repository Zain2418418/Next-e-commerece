import { NextResponse } from 'next/server';
import dbconnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbconnect();
    
    // `.populate('category')` allows category name extraction seamlessly
    const products = await Product.find({}).populate('category');

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}