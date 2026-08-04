import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // Ya aap ka MongoDB connection file path
import Product from '@/models/Product';  // Aap ka Product model
import Category from '@/models/Category'; // Aap ka Category model
import { MOCK_PRODUCTS, CATEGORIES } from '@/lib/mockData';

export async function GET() {
  try {
    await dbConnect();
    
    // 1. Purana empty/broken data clear karein (Safe reset)
    await Category.deleteMany({});
    await Product.deleteMany({});

    // 2. Mock Categories ko MongoDB ke format me convert kar ke daalein
    const categoryDocs = CATEGORIES.filter(c => c !== 'All').map(name => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }));
    await Category.insertMany(categoryDocs);

    // 3. Mock Products ko MongoDB me insert karein
    // Note: Agar Product model me `id` ki jagah default MongoDB `_id` chahiye toh extra fields adjust kar lenge
    const productDocs = MOCK_PRODUCTS.map(item => ({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      stock: item.stock || 10,
      rating: item.rating || 4.5,
      reviewsCount: item.reviewsCount || 5,
    }));

    await Product.insertMany(productDocs);

    return NextResponse.json({
      success: true,
      message: '✅ Hardcoded Mock Data successfully migrated to MongoDB!',
      categoriesAdded: categoryDocs.length,
      productsAdded: productDocs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}