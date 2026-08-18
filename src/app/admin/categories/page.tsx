'use client';

import { useState, useEffect } from 'react';
import {
  FolderPlus,
  Trash2,
  Loader2,
  Tags,
  Search,
  Edit2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Pagination from '@/components/Pagination';

interface Category {
  _id: string;
  name: string;
  slug?: string;
  createdAt?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 📝 New Category Form
  const [categoryName, setCategoryName] = useState('');
  const [adding, setAdding] = useState(false);

  // ✏️ Edit Category State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 🔍 Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // 1. Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
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

  // 2. Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setAdding(true);
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setCategories((prev) => [data.category, ...prev]);
        setCategoryName('');
        showTemporarySuccess('Category created successfully!');
      } else {
        alert(data.error || 'Failed to add category');
      }
    } catch (err) {
      alert('Error adding category');
    } finally {
      setAdding(false);
    }
  };

  // 3. Inline Edit Start
  const startEditing = (category: Category) => {
    setEditingId(category._id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  // Save Category Edit
  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === id ? { ...c, name: data.category.name, slug: data.category.slug } : c))
        );
        cancelEditing();
        showTemporarySuccess('Category updated successfully!');
      } else {
        alert(data.error || 'Failed to update category');
      }
    } catch (err) {
      alert('Error updating category');
    } finally {
      setUpdating(false);
    }
  };

  // 4. Delete Category
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setCategories((prev) => prev.filter((item) => item._id !== id));
        showTemporarySuccess('Category deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    } finally {
      setDeletingId(null);
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // 🔍 Filter & Search
  const filteredCategories = categories.filter((c) => {
    const search = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(search) || (c.slug && c.slug.toLowerCase().includes(search));
  });

  // 📄 Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tags className="text-indigo-600 dark:text-indigo-400" /> Categories Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Product catalog organize karne ke liye categories create aur manage karein.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800 self-start md:self-auto">
          Total Categories: {categories.length}
        </div>
      </div>

      {/* Temporary Alerts */}
      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Add Category Card */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Create New Category
        </h2>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name (e.g. Smart Watches, Laptops)"
            required
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shrink-0"
          >
            {adding ? <Loader2 className="animate-spin" size={16} /> : <FolderPlus size={16} />}
            Add Category
          </button>
        </form>
      </div>

      {/* Toolbar Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories or slugs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4">Category Name</th>
                  <th className="p-4">URL Slug</th>
                  <th className="p-4">ID</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {currentCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      No categories found matching your search.
                    </td>
                  </tr>
                ) : (
                  currentCategories.map((cat) => {
                    const isEditing = editingId === cat._id;

                    return (
                      <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                        {/* Name (Inline Edit input or text) */}
                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-3 py-1 text-sm bg-gray-50 dark:bg-gray-900 border border-indigo-500 rounded-lg focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            cat.name
                          )}
                        </td>

                        {/* Slug */}
                        <td className="p-4">
                          <span className="px-2.5 py-1 text-xs font-mono bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md">
                            /{cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}
                          </span>
                        </td>

                        {/* ID */}
                        <td className="p-4 text-xs font-mono text-gray-400">
                          #{cat._id.substring(cat._id.length - 6)}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSaveEdit(cat._id)}
                                disabled={updating}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition"
                                title="Save"
                              >
                                {updating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEditing(cat)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition"
                                title="Edit Category"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(cat._id)}
                                disabled={deletingId === cat._id}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition disabled:opacity-50"
                                title="Delete Category"
                              >
                                {deletingId === cat._id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}