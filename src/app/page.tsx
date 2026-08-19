'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Newsletter from '@/components/Newsletter';
import { CATEGORIES } from '@/lib/mockData';
import { ShieldCheck, Truck, Headphones, RefreshCw, ShoppingBag, Check } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState('featured');

  const [cart, setCart] = useState<any[]>([]);

  // Local Storage & Live Cart Sync
  useEffect(() => {
    const syncCart = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
      } catch (e) {
        console.error("Cart sync error:", e);
      }
    };

    syncCart();
    window.addEventListener('cart-updated', syncCart);
    window.addEventListener('storage', syncCart);

    return () => {
      window.removeEventListener('cart-updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  const getProductImage = (product: any) => {
    const img = product?.image;
    const name = product?.name?.toLowerCase() || '';

    if (typeof img === 'string' && img.startsWith('http') && !img.includes('placeholder')) {
      return img;
    }
    if (Array.isArray(img) && img.length > 0 && typeof img[0] === 'string' && img[0].startsWith('http')) {
      return img[0];
    }

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
          
          // Local stock adjust logic based on cart items
          const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
          const adjustedProducts = list.map((p: any) => {
            const pId = p._id || p.id;
            const inCartItem = savedCart.find((c: any) => (c._id || c.id) === pId);
            const cartQty = inCartItem ? (inCartItem.quantity || 1) : 0;
            const currentStock = p.stock !== undefined ? p.stock : 10;
            return {
              ...p,
              stock: Math.max(0, currentStock - cartQty)
            };
          });

          setProducts(adjustedProducts);
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

  // Home page Add to Cart + Live Stock Reduction
  const handleCartToggle = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    const productId = product._id || product.id;
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = existingCart.findIndex((item: any) => (item._id || item.id) === productId);

    let updatedCart = [...existingCart];
    let stockChange = 0;

    if (itemIndex > -1) {
      // If already in cart, remove it and restore stock
      const removedItem = updatedCart[itemIndex];
      stockChange = removedItem.quantity || 1;
      updatedCart.splice(itemIndex, 1);
    } else {
      // Add to cart and reduce stock by 1
      if ((product.stock ?? 10) <= 0) {
        alert("Sorry, product out of stock!");
        return;
      }
      stockChange = -1;
      const imgSrc = getProductImage(product);
      updatedCart.push({
        _id: productId,
        id: productId,
        name: product.name,
        price: product.price,
        image: imgSrc,
        quantity: 1,
      });
    }

    // Live Stock Update in UI State
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if ((p._id || p.id) === productId) {
          const newStock = Math.max(0, (p.stock ?? 10) + stockChange);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);

    // Notify other components
    window.dispatchEvent(new Event('cart-updated'));
    window.dispatchEvent(new Event('storage'));
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

      {/* Shipping Info Banner */}
      <section className="bg-white border-y border-slate-200/80 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/60">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Free Express Shipping</h4>
              <p className="text-xs text-gray-500">On all store orders over $50</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">100% Secure Payment</h4>
              <p className="text-xs text-gray-500">Encrypted transactions & safety</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-violet-50/50 border border-violet-100/60">
            <div className="p-3 bg-violet-600 text-white rounded-xl shadow-md shadow-violet-200">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Hassle-Free Returns</h4>
              <p className="text-xs text-gray-500">10-day money-back guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/60">
            <div className="p-3 bg-amber-600 text-white rounded-xl shadow-md shadow-amber-200">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">24/7 Live Support</h4>
              <p className="text-xs text-gray-500">Dedicated customer assistance</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Curated Collection
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Explore Our Premium Products
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Discover top-tier crafted items tailored for your everyday style and technological needs.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8 lg:items-start">
          {/* Filters Sidebar */}
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

          {/* Product Grid */}
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
              <div className="text-center py-20 text-slate-500 font-medium">Loading Products...</div>
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
                  const isInCart = cart.some((item) => (item._id || item.id) === productId);

                  return (
                    <div key={productId} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                      <div>
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
                              {product.name}
                            </Link>
                          </h3>

                          <div className="flex items-center space-x-1.5">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="text-xs font-semibold text-gray-700">{Number(product.rating || 5).toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({product.reviewsCount || 0})</span>
                          </div>

                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 mt-auto">
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <div>
                            <span className="text-lg font-black text-gray-900">${product.price}</span>
                            <div className={`text-[10px] font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleCartToggle(e, product)}
                            disabled={product.stock <= 0 && !isInCart}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 z-10 cursor-pointer ${
                              isInCart
                                ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                                : product.stock <= 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-sm active:scale-95'
                            }`}
                          >
                            {isInCart ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" /> Add
                              </>
                            )}
                          </button>
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