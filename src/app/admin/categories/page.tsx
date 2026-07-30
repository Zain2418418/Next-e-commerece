'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, Layers } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  // Dummy Categories Data (Frontend Testing ke liye)
  const dummyCategories = [
    { id: '1', name: 'Electronics', slug: 'electronics', productCount: 18 },
    { id: '2', name: 'Furniture', slug: 'furniture', productCount: 12 },
    { id: '3', name: 'Fashion & Apparel', slug: 'fashion-apparel', productCount: 25 },
    { id: '4', name: 'Books & Stationery', slug: 'books-stationery', productCount: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Category Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Store ki tamam product categories yahan organize karein.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Total Products</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {dummyCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {/* Name */}
                  <td className="p-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Layers size={16} className="text-indigo-500" />
                    {cat.name}
                  </td>

                  {/* Slug */}
                  <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                    /{cat.slug}
                  </td>

                  {/* Product Count */}
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                      {cat.productCount} Products
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
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

      {/* Add Category Modal (Popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Add New Category</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Footwear"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCategoryName('');
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}