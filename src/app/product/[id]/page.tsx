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

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

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
          const productId = rawProduct._id || rawProduct.id;

          // Deduct stock based on items already in cart
          const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
          const cartItem = existingCart.find((i: any) => (i._id || i.id) === productId);
          const cartQty = cartItem ? (cartItem.quantity || 1) : 0;
          const initialStock = rawProduct.stock !== undefined ? rawProduct.stock : 10;

          setProduct({
            ...rawProduct,
            stock: Math.max(0, initialStock - cartQty),
          });
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

  useEffect(() => {
    if (!product) return;
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const productId = product._id || product.id;
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

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      alert("Item is out of stock!");
      return;
    }

    if (quantity > product.stock) {
      alert(`Only ${product.stock} items left in stock!`);
      return;
    }

    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemIndex = existingCart.findIndex((item: any) => (item._id || item.id) === productId);

      if (itemIndex > -1) {
        // Agar pehle se hai toh utni quantity increment ho jayegi
        existingCart[itemIndex].quantity = (existingCart[itemIndex].quantity || 1) + quantity;
      } else {
        // Naya item add karo select ki hui quantity ke saath
        existingCart.push({
          _id: productId,
          id: productId,
          name: product.name,
          price: product.price,
          image: imgSrc,
          quantity: quantity,
        });
      }

      // Remaining stock screen par live deduct hoga
      setProduct((prev: any) => ({
        ...prev,
        stock: prev.stock - quantity,
      }));

      localStorage.setItem('cart', JSON.stringify(existingCart));

      // Header ya navbar cart badge refresh karne ke liye events
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('storage'));

      // 2 seconds ke liye green button indicator dikhao
      setAddedToCart(true);
      setQuantity(1); // Reset counter to 1 for next addition
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
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
                  {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="flex justify-between items-center text-sm border-t border-slate-200/60 pt-4">
                  <span className="text-slate-500 font-medium">Quantity</span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 transition font-bold text-slate-700"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-bold w-12 text-center text-slate-900 select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 transition font-bold text-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                {product.stock > 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 active:scale-[0.98] ${
                      addedToCart 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  >
                    {addedToCart ? '✓ Added to Cart!' : `Add ${quantity > 1 ? `${quantity} Items` : 'to Cart'}`}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-200 text-slate-400 cursor-not-allowed"
                  >
                    Out of Stock
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