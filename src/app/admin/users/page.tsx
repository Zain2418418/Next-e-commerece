'use client';

import { useState, useEffect } from 'react';
import { Users, Trash2, Loader2, Shield, User, Search, UserCheck, UserX, CheckCircle, AlertCircle } from 'lucide-react';
import Pagination from '@/components/Pagination';

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: 'active' | 'blocked';
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 🔍 Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // 📄 Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // 1. Fetch live users from MongoDB API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/users');
      const data = await res.json();

      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Something went wrong fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Role Toggle Handler
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        showTemporarySuccess('User role updated successfully!');
      } else {
        alert(data.error || 'Failed to update user role');
      }
    } catch (err) {
      alert('Error updating role');
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Status Toggle Handler (Block / Active)
  const handleStatusToggle = async (userId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: nextStatus as any } : u))
        );
        showTemporarySuccess(`User ${nextStatus === 'blocked' ? 'blocked' : 'activated'}!`);
      } else {
        alert(data.error || 'Failed to update user status');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. Delete User Action
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        showTemporarySuccess('User deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    } finally {
      setUpdatingId(null);
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // 🔍 Filter & Search Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-600 dark:text-indigo-400" /> Users Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Registered customers aur system administrators ko manage karein.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* Temporary Alert Messages */}
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

      {/* 🛠 Toolbar: Search & Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Customers (Users)</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((u) => {
                    const isBlocked = u.status === 'blocked';
                    const isUpdating = updatingId === u._id;

                    return (
                      <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        {/* User Name & Avatar */}
                        <td className="p-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : <User size={18} />}
                          </div>
                          <div>
                            <p className="font-semibold">{u.name || 'N/A'}</p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: #{u._id.substring(u._id.length - 6)}</p>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="p-4 text-gray-600 dark:text-gray-300">{u.email}</td>

                        {/* Role Selector */}
                        <td className="p-4">
                          <select
                            value={u.role || 'user'}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* Status Badge & Toggle */}
                        <td className="p-4">
                          <button
                            onClick={() => handleStatusToggle(u._id, u.status)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                              isBlocked
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            }`}
                          >
                            {isBlocked ? <UserX size={12} /> : <UserCheck size={12} />}
                            {isBlocked ? 'Blocked' : 'Active'}
                          </button>
                        </td>

                        {/* Joined Date */}
                        <td className="p-4 text-xs text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(u._id)}
                            disabled={isUpdating}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition disabled:opacity-50"
                            title="Delete User"
                          >
                            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Reusable Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}