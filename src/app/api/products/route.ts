import { NextResponse } from 'next/server';
import dbconnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category'; // Ensures Mongoose registers Category Schema

export async function GET() {
  try {
    await dbconnect();

    if (!Category) {
      console.log('Initializing Category Model...');
    }

    const products = await Product.find({}).populate('category').lean();

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}