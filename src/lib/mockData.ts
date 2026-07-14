export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviewsCount: number;
  stock: number;
}

export const CATEGORIES = ["All", "Electronics", "Fashion", "Footwear", "Accessories"];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Wireless Noise-Cancelling Headphones",
    description: "Experience premium sound quality with active noise cancellation and 40-hour battery life.",
    price: 199,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    rating: 4.8,
    reviewsCount: 120,
    stock: 15,
  },
  {
    id: "prod-2",
    name: "Minimalist Leather Watch",
    description: "Elegant quartz watch featuring a genuine leather strap and scratch-resistant glass.",
    price: 129,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
    rating: 4.5,
    reviewsCount: 85,
    stock: 8,
  },
  {
    id: "prod-3",
    name: "Premium Knit Running Shoes",
    description: "Lightweight and breathable sneakers designed for maximum comfort and speed.",
    price: 89,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
    rating: 4.7,
    reviewsCount: 240,
    stock: 25,
  },
  {
    id: "prod-4",
    name: "Classic Denim Jacket",
    description: "Durable cotton denim jacket with a relaxed fit—a timeless addition to any wardrobe.",
    price: 75,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60",
    rating: 4.3,
    reviewsCount: 64,
    stock: 12,
  },
  {
    id: "prod-5",
    name: "Smart Fitness Band Pro",
    description: "Track your workouts, heart rate, and sleep quality with built-in GPS and AMOLED display.",
    price: 49,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60",
    rating: 4.2,
    reviewsCount: 95,
    stock: 30,
  }
];