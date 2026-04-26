'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    todayIncome: 0,
    monthIncome: 0,
    confirmedCount: 0,
    pendingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
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
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, total, status, created_at');

      if (ordersErr) throw ordersErr;

      const incomeOrders = (orders || []).filter(
        (o) => o.status === 'confirmed' || o.status === 'completed'
      );

      const totalIncome = incomeOrders.reduce((sum, o) => sum + Number(o.total), 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIncome = incomeOrders
        .filter((o) => new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + Number(o.total), 0);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthIncome = incomeOrders
        .filter((o) => new Date(o.created_at) >= monthStart)
        .reduce((sum, o) => sum + Number(o.total), 0);

      const counts = {
        confirmed: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
      };
      (orders || []).forEach((o) => {
        if (counts[o.status] !== undefined) counts[o.status]++;
      });

      const { data: items } = await supabase
        .from('order_items')
        .select(`
          qty,
          price,
          products(name),
          orders!inner(status)
        `);

      const productMap = {};
      (items || []).forEach((item) => {
        const status = item.orders?.status;
        if (status !== 'confirmed' && status !== 'completed') return;
        const name = item.products?.name || 'Unknown';
        if (!productMap[name]) {
          productMap[name] = { name, qty: 0, revenue: 0 };
        }
        productMap[name].qty += item.qty;
        productMap[name].revenue += item.qty * Number(item.price);
      });

      const topProducts = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalIncome,
        todayIncome,
        monthIncome,
        confirmedCount: counts.confirmed,
        pendingCount: counts.pending,
        completedCount: counts.completed,
        cancelledCount: counts.cancelled,
        topProducts,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-[#6b4423]">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#6b4423]">Dashboard</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Income Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#c8794a] to-[#b6663a] text-white rounded-lg p-6 shadow-md">
          <p className="text-sm opacity-90 mb-1">Total Income</p>
          <p className="text-3xl font-bold">
            Rp {stats.totalIncome.toLocaleString('id-ID')}
          </p>
          <p className="text-xs opacity-75 mt-2">Confirmed + Completed</p>
        </div>

        <div className="bg-white border-2 border-[#e8d5c4] rounded-lg p-6 shadow-md">
          <p className="text-sm text-[#8b6f47] mb-1">Today's Income</p>
          <p className="text-3xl font-bold text-[#6b4423]">
            Rp {stats.todayIncome.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-[#8b6f47] mt-2">Since 00:00 today</p>
        </div>

        <div className="bg-white border-2 border-[#e8d5c4] rounded-lg p-6 shadow-md">
          <p className="text-sm text-[#8b6f47] mb-1">This Month</p>
          <p className="text-3xl font-bold text-[#6b4423]">
            Rp {stats.monthIncome.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-[#8b6f47] mt-2">Current month</p>
        </div>
      </div>

      {/* Order Status Cards */}
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

      {/* Top Products */}
      <div className="bg-white border-2 border-[#e8d5c4] rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-[#6b4423] mb-4">Top Products (Income)</h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-[#8b6f47]">No sales yet</p>
        ) : (
          <div className="space-y-3">
            {stats.topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center gap-4">
                <span className="text-2xl font-bold text-[#c8794a] w-8">
                  #{idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-[#6b4423]">{p.name}</p>
                  <p className="text-xs text-[#8b6f47]">{p.qty} sold</p>
                </div>
                <p className="font-bold text-[#c8794a]">
                  Rp {p.revenue.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
