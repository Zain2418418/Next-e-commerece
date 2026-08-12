import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category'; // Register model

export async function GET(req: Request, { params }: { params: any }) {
  try {
    await dbConnect();

    // Ensure Category Schema Registered
    if (!Category) {
      console.log('Category Model check');
    }

    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json({ success: false, error: 'Invalid Product ID' }, { status: 400 });
    }

    const product = await Product.findById(id).populate('category', 'name slug').lean();
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}