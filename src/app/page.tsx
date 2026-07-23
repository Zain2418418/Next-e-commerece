'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS, CATEGORIES, Product } from '@/lib/mockData';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  // 🔄 Multi-category selection array state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortBy, setSortBy] = useState('featured');

  // Available categories excluding 'All' for checkbox lists
  const availableCategories = useMemo(() => {
    return CATEGORIES.filter((cat) => cat !== 'All');
  }, []);

  // 🔄 Category toggle handler function
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

  // Filtered and Sorted Products logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 🔄 Multi-category match check
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured (default array order)
    });
  }, [searchQuery, selectedCategories, maxPrice, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Hero Header Section */}
      <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl mb-10 border border-gray-100">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Discover Premium Essentials
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Explore curated top-tier products crafted for modern lifestyle, performance, and everyday luxury.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-x-8 lg:items-start">
        {/* FILTERS SIDEBAR (Desktop) */}
        <div className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
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

          {/* 🔄 Multi-Category Checkboxes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categories
            </label>
            <div className="space-y-2.5">
              {availableCategories.map((cat) => {
                const isChecked = selectedCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-black cursor-pointer select-none"
                  >
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

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price: <span className="font-bold text-blue-600">${maxPrice}</span>
            </label>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-lg border-gray-300 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* PRODUCTS AREA */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar (Search + Quick Multi-Select Categories) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            {/* Search Box */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            {/* Category Quick Multi-Select Tabs */}
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
              <button
                onClick={() => setSelectedCategories([])}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategories.length === 0
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      isSelected
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Status Display */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-lg">No products found matching your search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories([]);
                  setMaxPrice(250);
                }}
                className="mt-4 inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  {/* Image wrapper */}
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 group-hover:opacity-95 transition-all duration-300 relative h-64">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Details Box */}
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        <Link href={`/product/${product.id}`}>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.name}
                        </Link>
                      </h3>
                    </div>

                    {/* Rating display */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.reviewsCount})</span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-black text-gray-900">${product.price}</span>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        In Stock ({product.stock})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}