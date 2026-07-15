import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

// 1. GET SINGLE PRODUCT DETAILS
export async function GET(req: Request, { params }: { params: any }) {
  try {
    await dbConnect();
    const { id } = params;

    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. UPDATE PRODUCT
export async function PUT(req: Request, { params }: { params: any }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();

    const updatedProduct = await Product.findByIdAndUpdate(id, body, {
      new: true, // Updated object return karega
      runValidators: true, // Schema validation check karega
    });

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 3. DELETE PRODUCT
export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    await dbConnect();
    const { id } = params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}