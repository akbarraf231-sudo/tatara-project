'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminVouchers } from '@/components/admin/AdminVouchers';
import { AdminExpenses } from '@/components/admin/AdminExpenses';
import { AdminLanding } from '@/components/admin/AdminLanding';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminCustomers } from '@/components/admin/AdminCustomers';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/';
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fce8e2]">
        <p className="text-[#5a1f2a]">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'customers', label: '👥 Pelanggan' },
    { id: 'orders', label: '📦 Orders' },
    { id: 'products', label: '🍰 Products' },
    { id: 'vouchers', label: '🎟️ Vouchers' },
    { id: 'expenses', label: '💸 Expenses' },
    { id: 'landing', label: '📝 Landing Page' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#fce8e2]">
      <div className="bg-[#5a1f2a] text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">🍰</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
              <p className="text-[#e3b9b9] text-sm">Sinar Jaya Bakery</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { window.location.href = '/'; }}
              className="bg-white text-[#5a1f2a] hover:bg-[#fce8e2] font-semibold py-2 px-4 rounded-full transition-colors"
            >
              ← View Site
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b-2 border-[#e3b9b9] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-2 px-4 py-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 font-semibold rounded-full transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-[#5a1f2a] text-white shadow-md'
                  : 'bg-[#fce8e2] text-[#5a1f2a] hover:bg-[#e3b9b9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'customers' && <AdminCustomers />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'vouchers' && <AdminVouchers />}
        {activeTab === 'expenses' && <AdminExpenses />}
        {activeTab === 'landing' && <AdminLanding />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}
