'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Newsletter from '@/components/Newsletter';
import { CATEGORIES } from '@/lib/mockData';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState('featured');

  // Smart Dynamic Image Extractor
  const getProductImage = (product: any) => {
    const img = product?.image;
    const name = product?.name?.toLowerCase() || '';

    // 1. Check if DB has valid image string
    if (typeof img === 'string' && img.startsWith('http') && !img.includes('placeholder')) {
      return img;
    }
    
    // 2. Check if DB has valid image array with elements
    if (Array.isArray(img) && img.length > 0 && typeof img[0] === 'string' && img[0].startsWith('http')) {
      return img[0];
    }

    // 3. Fallback based on Product Name/Category
    if (name.includes('watch') || name.includes('leather')) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
    }
    if (name.includes('shoe') || name.includes('sneaker') || name.includes('knit') || name.includes('running')) {
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
    }
    if (name.includes('jacket') || name.includes('denim') || name.includes('fashion') || name.includes('cloth')) {
      return 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80';
    }
    if (name.includes('headphone') || name.includes('audio') || name.includes('cancelling') || name.includes('wireless')) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
    }

    return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (res.ok) {
          const list = Array.isArray(data) ? data : data.products || [];
          setProducts(list);
        }
      } catch (err) {
        console.error('Error fetching home products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const availableCategories = useMemo(() => {
    return CATEGORIES.filter((cat) => cat !== 'All');
  }, []);

  const handleCategoryToggle = (category: string) => {
    if (category === 'All') {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(categoryName);

      const matchesPrice = (product.price || 0) <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, searchQuery, selectedCategories, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8 lg:items-start">
          
          {/* Sidebar Filters */}
          <div className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Clear ({selectedCategories.length})
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
              <div className="space-y-2.5">
                {availableCategories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label key={cat} className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-black cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(cat)}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price: <span className="font-bold text-indigo-600">${maxPrice}</span>
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full rounded-lg border-gray-300 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full sm:max-w-xs rounded-lg border border-gray-300 py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />

              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto py-1">
                <button
                  onClick={() => setSelectedCategories([])}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    selectedCategories.length === 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-500 font-medium">Loading Products from Database...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-500 text-lg">No products found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const productId = product._id || product.id;
                  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
                  const imgSrc = getProductImage(product);

                  return (
                    <div key={productId} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="w-full h-64 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={imgSrc}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        {categoryName && (
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border border-gray-200 shadow-sm">
                            {categoryName}
                          </span>
                        )}
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          <Link href={`/product/${productId}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                          </Link>
                        </h3>

                        <div className="flex items-center space-x-1.5">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-xs font-semibold text-gray-700">{product.rating || 5.0}</span>
                          <span className="text-xs text-gray-400">({product.reviewsCount || 0})</span>
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-black text-gray-900">${product.price}</span>
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            In Stock ({product.stock ?? 10})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <Newsletter />
      </div>
    </div>
  );
}