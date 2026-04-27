'use client';

import { useState, useEffect } from 'react';
import { AdminAIChat } from './AdminAIChat';
import { AdminInsights } from './AdminInsights';
import { AdminInventory } from './AdminInventory';
import { AdminOnboarding } from './AdminOnboarding';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('insights');
  const [stats, setStats] = useState({
    totalIncome: 0,
    todayIncome: 0,
    monthIncome: 0,
    totalExpenses: 0,
    todayExpenses: 0,
    monthExpenses: 0,
    netProfit: 0,
    confirmedCount: 0,
    pendingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    dailyOrderCount: 0,
    specialOrderCount: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'x-admin-token': token },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Gagal load dashboard');

      const orders = result.orders || [];
      const items = result.items || [];
      const expenses = result.expenses || [];

      const incomeOrders = orders.filter((o) => o.status === 'confirmed' || o.status === 'completed');
      const totalIncome = incomeOrders.reduce((sum, o) => sum + Number(o.total), 0);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayIncome = incomeOrders
        .filter((o) => new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + Number(o.total), 0);

      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const monthIncome = incomeOrders
        .filter((o) => new Date(o.created_at) >= monthStart)
        .reduce((sum, o) => sum + Number(o.total), 0);

      const todayStr = new Date().toISOString().slice(0, 10);
      const monthStr = todayStr.slice(0, 7);
      const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
      const todayExpenses = expenses.filter((e) => e.expense_date === todayStr).reduce((s, e) => s + Number(e.amount), 0);
      const monthExpenses = expenses.filter((e) => e.expense_date >= monthStr + '-01').reduce((s, e) => s + Number(e.amount), 0);

      const counts = { confirmed: 0, pending: 0, completed: 0, cancelled: 0 };
      let dailyOrderCount = 0;
      let specialOrderCount = 0;
      orders.forEach((o) => {
        if (counts[o.status] !== undefined) counts[o.status]++;
        if (o.order_type === 'special') specialOrderCount++;
        else dailyOrderCount++;
      });

      const productMap = {};
      items.forEach((item) => {
        const status = item.orders?.status;
        if (status !== 'confirmed' && status !== 'completed') return;
        const name = item.products?.name || 'Unknown';
        if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0 };
        productMap[name].qty += item.qty;
        productMap[name].revenue += item.qty * Number(item.price);
      });

      const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      setStats({
        totalIncome, todayIncome, monthIncome,
        totalExpenses, todayExpenses, monthExpenses,
        netProfit: totalIncome - totalExpenses,
        confirmedCount: counts.confirmed,
        pendingCount: counts.pending,
        completedCount: counts.completed,
        cancelledCount: counts.cancelled,
        dailyOrderCount, specialOrderCount,
        topProducts,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-[#5a1f2a]">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5a1f2a]">📊 Admin Dashboard</h2>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-[#e3b9b9] overflow-x-auto">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-4 whitespace-nowrap ${
            activeTab === 'insights'
              ? 'border-[#5a1f2a] text-[#5a1f2a]'
              : 'border-transparent text-[#722f37] hover:text-[#5a1f2a]'
          }`}
        >
          📊 Insights
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-4 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-[#5a1f2a] text-[#5a1f2a]'
              : 'border-transparent text-[#722f37] hover:text-[#5a1f2a]'
          }`}
        >
          📦 Inventory
        </button>
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-4 whitespace-nowrap ${
            activeTab === 'onboarding'
              ? 'border-[#5a1f2a] text-[#5a1f2a]'
              : 'border-transparent text-[#722f37] hover:text-[#5a1f2a]'
          }`}
        >
          🎓 Onboarding
        </button>
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && <AdminInsights />}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && <AdminInventory />}

      {/* Onboarding Tab */}
      {activeTab === 'onboarding' && <AdminOnboarding />}

      {/* Quick Stats Section */}
      {activeTab === 'insights' && (
        <>
          <hr className="my-8 border-[#e3b9b9]" />

      {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>}

      {/* Income / Expense / Profit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#5a1f2a] to-[#722f37] text-white rounded-lg p-6 shadow-md">
          <p className="text-sm opacity-90 mb-1">💰 Total Income</p>
          <p className="text-3xl font-bold">Rp {stats.totalIncome.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-75 mt-2">Confirmed + Completed</p>
        </div>
        <div className="bg-gradient-to-br from-orange-700 to-orange-900 text-white rounded-lg p-6 shadow-md">
          <p className="text-sm opacity-90 mb-1">💸 Total Pengeluaran</p>
          <p className="text-3xl font-bold">Rp {stats.totalExpenses.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-75 mt-2">Pembelian + Operasional</p>
        </div>
        <div className={`text-white rounded-lg p-6 shadow-md ${
          stats.netProfit >= 0 ? 'bg-gradient-to-br from-green-700 to-green-900' : 'bg-gradient-to-br from-red-700 to-red-900'
        }`}>
          <p className="text-sm opacity-90 mb-1">📈 Net Profit</p>
          <p className="text-3xl font-bold">Rp {stats.netProfit.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-75 mt-2">Income − Expense</p>
        </div>
      </div>

      {/* Today / Month breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4">
          <p className="text-xs text-[#722f37]">Income Hari Ini</p>
          <p className="text-xl font-bold text-[#5a1f2a]">Rp {stats.todayIncome.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4">
          <p className="text-xs text-[#722f37]">Income Bulan Ini</p>
          <p className="text-xl font-bold text-[#5a1f2a]">Rp {stats.monthIncome.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
          <p className="text-xs text-orange-700">Expense Hari Ini</p>
          <p className="text-xl font-bold text-orange-800">Rp {stats.todayExpenses.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
          <p className="text-xs text-orange-700">Expense Bulan Ini</p>
          <p className="text-xl font-bold text-orange-800">Rp {stats.monthExpenses.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Order status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-3xl mb-1">⏳</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pendingCount}</p>
          <p className="text-xs text-yellow-700">Pending</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl mb-1">✅</p>
          <p className="text-2xl font-bold text-green-800">{stats.confirmedCount}</p>
          <p className="text-xs text-green-700">Confirmed</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <p className="text-3xl mb-1">📦</p>
          <p className="text-2xl font-bold text-blue-800">{stats.completedCount}</p>
          <p className="text-xs text-blue-700">Completed</p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
          <p className="text-3xl mb-1">❌</p>
          <p className="text-2xl font-bold text-red-800">{stats.cancelledCount}</p>
          <p className="text-xs text-red-700">Cancelled</p>
        </div>
      </div>

      {/* Daily vs Special */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-semibold">☀️ Daily Orders</p>
          <p className="text-3xl font-bold text-yellow-900">{stats.dailyOrderCount}</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800 font-semibold">🎂 Special Orders</p>
          <p className="text-3xl font-bold text-purple-900">{stats.specialOrderCount}</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-[#5a1f2a] mb-4">Top Products (Income)</h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-[#722f37]">No sales yet</p>
        ) : (
          <div className="space-y-3">
            {stats.topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center gap-4">
                <span className="text-2xl font-bold text-[#5a1f2a] w-8">#{idx + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#5a1f2a]">{p.name}</p>
                  <p className="text-xs text-[#722f37]">{p.qty} sold</p>
                </div>
                <p className="font-bold text-[#5a1f2a]">Rp {p.revenue.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

        </>
      )}

      {/* AI Assistant */}
      <AdminAIChat />
    </div>
  );
}
