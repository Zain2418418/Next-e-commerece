'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart } from 'lucide-react';
import ProductReviews from '@/components/ProductReviews';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const [cartQuantity, setCartQuantity] = useState<number>(0);
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);

  const getProductImage = (prod: any) => {
    const img = prod?.image;
    const name = prod?.name?.toLowerCase() || '';

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
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${resolvedParams.id}`);
        const result = await res.json();

        if (res.ok && (result.data || result._id || result.id)) {
          const rawProduct = result.data || result;
          setProduct(rawProduct);
        } else {
          setHasError(true);
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    }

    if (resolvedParams.id) {
      fetchProduct();
    }
  }, [resolvedParams.id]);

  // Sync Cart Quantity & Wishlist from localStorage
  useEffect(() => {
    if (!product) return;
    const productId = product._id || product.id;

    try {
      // Cart check
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartItem = existingCart.find((item: any) => (item._id || item.id) === productId);
      setCartQuantity(cartItem ? cartItem.quantity || 1 : 0);

      // Wishlist check
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const exists = savedWishlist.some((item: any) => (item._id || item.id) === productId);
      setIsInWishlist(exists);
    } catch (e) {
      console.error(e);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="w-full bg-white text-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (hasError || !product) {
    notFound();
  }

  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  const productId = product._id || product.id;
  const imgSrc = getProductImage(product);
  const numericRating = Math.min(5, Math.max(0, Number(product.rating) || 5));

  const handleToggleWishlist = () => {
    try {
      const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const index = existingWishlist.findIndex((item: any) => (item._id || item.id) === productId);

      let updatedWishlist;
      if (index > -1) {
        updatedWishlist = existingWishlist.filter((item: any) => (item._id || item.id) !== productId);
        setIsInWishlist(false);
      } else {
        updatedWishlist = [
          ...existingWishlist,
          {
            _id: productId,
            id: productId,
            name: product.name,
            price: product.price,
            image: imgSrc,
            category: categoryName,
          },
        ];
        setIsInWishlist(true);
      }

      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    }
  };

  const handleUpdateCartQuantity = (newQty: number) => {
    const maxStock = product.stock !== undefined ? product.stock : 10;
    
    if (newQty > maxStock) {
      alert(`Only ${maxStock} items available in stock!`);
      return;
    }

    try {
      let existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemIndex = existingCart.findIndex((item: any) => (item._id || item.id) === productId);

      if (newQty <= 0) {
        // Remove from cart if quantity goes to 0
        existingCart = existingCart.filter((item: any) => (item._id || item.id) !== productId);
        setCartQuantity(0);
      } else {
        if (itemIndex > -1) {
          existingCart[itemIndex].quantity = newQty;
        } else {
          existingCart.push({
            _id: productId,
            id: productId,
            name: product.name,
            price: product.price,
            image: imgSrc,
            quantity: newQty,
          });
        }
        setCartQuantity(newQty);
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));

      // Trigger cart event for navbar badge update
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Breadcrumb Navigation */}
        <nav className="flex text-sm text-slate-500 space-x-2">
          <Link href="/" className="hover:text-indigo-600 transition-colors font-medium">Home</Link>
          <span>/</span>
          <span className="text-slate-500 font-medium">{categoryName || 'General'}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

          <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 flex items-center justify-center min-h-[350px] max-h-[500px] shadow-sm relative group">
            <img
              src={imgSrc}
              alt={product.name || 'Product'}
              className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-300"
            />
          </div>

          <div className="flex flex-col justify-between py-2 space-y-6">
            <div className="space-y-4">
              {categoryName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wider border border-indigo-100">
                  {categoryName}
                </span>
              )}

              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                {product.name}
              </h1>

              <div className="flex items-center space-x-3">
                <div className="flex items-center text-amber-400 text-lg">
                  {"★".repeat(Math.round(numericRating))}
                  {"☆".repeat(5 - Math.round(numericRating))}
                </div>
                <span className="text-sm font-bold text-slate-800">{numericRating.toFixed(1)} / 5.0</span>
                <span className="text-slate-300">|</span>
                <span className="text-sm text-slate-500">{product.reviewsCount || 0} customer reviews</span>
              </div>

              <div className="border-t border-b border-slate-100 py-4">
                <span className="text-3xl font-black text-slate-900">${product.price}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Overview</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 space-y-4 shadow-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Status / Stock</span>
                <span className={`font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Action Area: Add to Cart Toggle Button & Wishlist */}
              <div className="pt-2 flex items-center gap-3">
                {product.stock <= 0 ? (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-200 text-slate-400 cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : cartQuantity > 0 ? (
                  /* Toggle UI when item is in cart */
                  <div className="flex-1 flex items-center justify-between border-2 border-indigo-600 rounded-xl p-1 bg-indigo-50/50 shadow-sm">
                    <button
                      onClick={() => handleUpdateCartQuantity(cartQuantity - 1)}
                      className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-extrabold hover:bg-indigo-100 transition shadow-sm active:scale-95"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-indigo-900 select-none">
                      {cartQuantity} in Cart
                    </span>
                    <button
                      onClick={() => handleUpdateCartQuantity(cartQuantity + 1)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-extrabold hover:bg-indigo-700 transition shadow-sm active:scale-95"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  /* Standard Add to Cart button when not in cart */
                  <button
                    onClick={() => handleUpdateCartQuantity(1)}
                    className="flex-1 flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
                  >
                    Add to Cart
                  </button>
                )}

                <button
                  onClick={handleToggleWishlist}
                  aria-label="Add to Wishlist"
                  className={`p-3.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                    isInWishlist
                      ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <ProductReviews productId={productId} />
        </div>

      </div>
    </div>
  );
}