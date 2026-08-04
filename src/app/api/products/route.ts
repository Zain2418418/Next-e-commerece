import { NextResponse } from 'next/server';
import dbconnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category'; // 👈 Essential: Forces Mongoose to register Category Schema

export async function GET() {
  try {
    await dbconnect();

    // Touch Category model to guarantee registration before populate runs
    if (!Category) {
      console.log('Initializing Category Model...');
    }

    const products = await Product.find({}).populate('category');

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}