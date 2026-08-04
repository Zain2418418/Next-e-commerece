import { NextResponse } from 'next/server';
import dbconnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { MOCK_PRODUCTS, CATEGORIES } from '@/lib/mockData';

export async function GET() {
  try {
    await dbconnect();

    // 1. Clear old data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // 2. Insert Categories and store created documents
    const categoryDocs = CATEGORIES.filter(c => c !== 'All').map(name => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }));
    
    const createdCategories = await Category.insertMany(categoryDocs);

    // Create a quick lookup map (e.g. "Electronics" => ObjectId)
    const categoryMap: { [key: string]: any } = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Map Products with correct Category ObjectId
    const productDocs = MOCK_PRODUCTS.map(item => {
      const categoryId = categoryMap[item.category] || createdCategories[0]._id;

      return {
        name: item.name,
        description: item.description,
        price: item.price,
        category: categoryId, // 👈 Passing proper ObjectId instead of string
        image: item.image,
        stock: item.stock || 10,
        rating: item.rating || 4.5,
        reviewsCount: item.reviewsCount || 5,
      };
    });

    await Product.insertMany(productDocs);

    return NextResponse.json({
      success: true,
      message: '✅ Hardcoded Mock Data successfully migrated to MongoDB with valid ObjectIds!',
      categoriesAdded: createdCategories.length,
      productsAdded: productDocs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}