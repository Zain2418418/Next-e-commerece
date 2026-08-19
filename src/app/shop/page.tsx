'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  // Sync Cart State with localStorage
  useEffect(() => {
    const syncCart = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
      } catch (e) {
        console.error('Cart sync error:', e);
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

  const fetchShopProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/products');
      const data = await res.json();

      if (res.ok) {
        const productList = Array.isArray(data) ? data : data.products || [];

        // Adjust initial stock based on items already in cart
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const adjustedProducts = productList.map((p: any) => {
          const pId = p._id || p.id;
          const inCartItem = savedCart.find((c: any) => (c._id || c.id) === pId);
          const cartQty = inCartItem ? (inCartItem.quantity || 1) : 0;
          const currentStock = p.stock !== undefined ? p.stock : 10;
          return {
            ...p,
            stock: Math.max(0, currentStock - cartQty),
          };
        });

        setProducts(adjustedProducts);
      } else {
        setError(data.error || 'Failed to load products');
      }
    } catch (err: any) {
      console.error('Error fetching shop products:', err);
      setError('Network error or server unreachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopProducts();
  }, []);

  // Client-Side Cart Toggle + Live Stock Reduction (Fixes Unauthorized Issue)
  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();   // Link navigation roknay k liye
    e.stopPropagation();  // Event bubbling roknay k liye

    const productId = product._id || product.id;
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = existingCart.findIndex((item: any) => (item._id || item.id) === productId);

    let updatedCart = [...existingCart];
    let stockChange = 0;

    if (itemIndex > -1) {
      // If already in cart, remove it (Toggle action)
      const removedItem = updatedCart[itemIndex];
      stockChange = removedItem.quantity || 1;
      updatedCart.splice(itemIndex, 1);
    } else {
      // Add to cart if stock is available
      if ((product.stock ?? 10) <= 0) {
        alert('Product is out of stock!');
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

    // Update Live Stock UI
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if ((p._id || p.id) === productId) {
          const newStock = Math.max(0, (p.stock ?? 10) + stockChange);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    // Save & Trigger App-wide Sync
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);

    window.dispatchEvent(new Event('cart-updated'));
    window.dispatchEvent(new Event('storage'));
  };

  if (loading) {
    return (
      <div className="w-full bg-white text-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Shop Catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchShopProducts}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Shop Products</h1>
          <p className="text-slate-500 text-sm mt-1">Browse through our full catalog synchronized directly from MongoDB.</p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No products found in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const productId = product._id || product.id;
              const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
              const imgSrc = getProductImage(product);
              const isInCart = cart.some((item) => (item._id || item.id) === productId);

              return (
                <Link 
                  key={productId} 
                  href={`/product/${productId}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-52 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={imgSrc}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      {categoryName && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200 shadow-sm">
                          {categoryName}
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <h2 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {product.name}
                      </h2>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="text-lg font-black text-slate-900 block">${product.price}</span>
                      <span className={`text-[10px] font-bold ${
                        (product.stock ?? 1) > 0 ? 'text-emerald-600' : 'text-rose-500'
                      }`}>
                        {(product.stock ?? 1) > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </span>
                    </div>

                    {/* ADD TO CART BUTTON */}
                    <button
                      type="button"
                      disabled={product.stock <= 0 && !isInCart}
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer ${
                        isInCart
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : product.stock <= 0
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isInCart ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        )}
                      </svg>
                      {isInCart ? 'Added' : 'Add'}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}