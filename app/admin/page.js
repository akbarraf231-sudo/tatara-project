'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminSettings } from '@/components/admin/AdminSettings';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('adminToken');
    router.push('/');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <p className="text-amber-700">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-amber-900 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-amber-100">Sinar Jaya Bakery</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-amber-100 border-b-2 border-amber-900">
        <div className="max-w-7xl mx-auto flex gap-1 px-4 py-4">
          {[
            { id: 'orders', label: '📦 Orders' },
            { id: 'products', label: '🥐 Products' },
            { id: 'settings', label: '⚙️ Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-900 text-white'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}
