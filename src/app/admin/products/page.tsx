'use client';

import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Eye } from 'lucide-react';

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy Products Data (Front-end UI testing ke liye)
  const dummyProducts = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      category: 'Electronics',
      price: 89.99,
      stock: 25,
      image: 'https://via.placeholder.com/50',
    },
    {
      id: '2',
      name: 'Ergonomic Gaming Chair',
      category: 'Furniture',
      price: 199.99,
      stock: 8,
      image: 'https://via.placeholder.com/50',
    },
    {
      id: '3',
      name: 'Smart Watch Series 7',
      category: 'Electronics',
      price: 299.00,
      stock: 0, // Out of stock example
      image: 'https://via.placeholder.com/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aap ke store ke tamam products yahan manage karein.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto">
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {dummyProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Name & Image */}
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</span>
                  </td>

                  {/* Category */}
                  <td className="p-4 text-gray-600 dark:text-gray-300">{product.category}</td>

                  {/* Price */}
                  <td className="p-4 font-bold text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</td>

                  {/* Stock */}
                  <td className="p-4">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        In Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Out of Stock
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}