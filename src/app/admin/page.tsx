'use client';

import { DollarSign, ShoppingBag, Package, Users, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Revenue', value: '$12,450', icon: DollarSign, change: '+12%' },
    { title: 'Total Orders', value: '320', icon: ShoppingBag, change: '+8%' },
    { title: 'Total Products', value: '45', icon: Package, change: '+2' },
    { title: 'Total Users', value: '1,240', icon: Users, change: '+18%' },
  ];

  // Dummy Sales Analytics Data (Monthly Revenue)
  const salesData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 8000 },
    { month: 'May', revenue: 9500 },
    { month: 'Jun', revenue: 12450 },
  ];

  // Category Breakdown Data (Pie Chart)
  const categoryData = [
    { name: 'Electronics', value: 45, color: '#6366f1' },
    { name: 'Furniture', value: 25, color: '#3b82f6' },
    { name: 'Fashion', value: 20, color: '#ec4899' },
    { name: 'Books', value: 10, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Store ki sales, growth aur revenue insights check karein.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-xs text-green-600 font-medium mt-4 flex items-center gap-1">
                <TrendingUp size={14} /> {stat.change} vs last month
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Growth Chart (2 Columns Wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Revenue Overview (2026)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share (1 Column Wide) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <h2 className="text-lg font-bold mb-2">Category Sales Share</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">{cat.name} ({cat.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}