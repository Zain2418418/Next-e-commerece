// 📁 src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbconnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbconnect();
    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Invalid Product ID' },
        { status: 400 }
      );
    }

    // Ensure Category model is loaded in Mongoose schema registry
    if (Category && Category.modelName) {
      // Prevents tree-shaking
    }

    let product;
    try {
      product = await Product.findById(id).populate('category').lean();
    } catch (populateErr) {
      console.warn('Single Product populate failed, fetching plain:', populateErr);
      product = await Product.findById(id).lean();
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, product },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API Error in GET /api/products/[id]:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}