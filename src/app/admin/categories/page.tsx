'use client';

import { useState, useEffect } from 'react';
import { FolderPlus, Trash2, Loader2, Tags } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Category Form State
  const [categoryName, setCategoryName] = useState('');
  const [adding, setAdding] = useState(false);

  // 1. Fetch categories from backend API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();

      if (data.success) {
        setCategories(data.categories || []);
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Something went wrong fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Add New Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setAdding(true);
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });
      const data = await res.json();

      if (data.success) {
        setCategories((prev) => [...prev, data.category]);
        setCategoryName('');
      } else {
        alert(data.error || 'Failed to add category');
      }
    } catch (err) {
      alert('Error adding category');
    } finally {
      setAdding(false);
    }
  };

  // 3. Delete Category
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setCategories((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Tags className="text-indigo-600" /> Categories Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create and manage product categories dynamically.
        </p>
      </div>

      {/* Add Category Form */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Add New Category
        </h2>
        <form onSubmit={handleAddCategory} className="flex gap-3 max-w-lg">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name (e.g. Electronics, Clothing)"
            required
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition disabled:opacity-50"
          >
            {adding ? <Loader2 className="animate-spin" size={16} /> : <FolderPlus size={16} />}
            Add
          </button>
        </form>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                <th className="p-4">Category Name</th>
                <th className="p-4">ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    No categories created yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                    <td className="p-4 text-xs font-mono text-gray-400">{cat._id}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}