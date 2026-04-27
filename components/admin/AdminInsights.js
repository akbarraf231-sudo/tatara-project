'use client';

import { useState, useEffect } from 'react';

export function AdminInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchInsights() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/insights', {
        headers: { 'x-admin-token': token },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Gagal load insights');
      setInsights(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-[#5a1f2a]">Loading insights...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>;
  if (!insights) return null;

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const maxSalesDay = Math.max(...Object.values(insights.salesByDay));

  const nextRecommendation = () => {
    setRecommendationIndex((prev) => (prev + 1) % insights.recommendations.length);
  };

  const prevRecommendation = () => {
    setRecommendationIndex((prev) => (prev - 1 + insights.recommendations.length) % insights.recommendations.length);
  };

  const currentRec = insights.recommendations[recommendationIndex];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5a1f2a]">📊 Business Intelligence</h2>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#5a1f2a] to-[#722f37] text-white rounded-lg p-4 shadow-md">
          <p className="text-xs opacity-90 mb-1">💰 Total Revenue</p>
          <p className="text-2xl font-bold">Rp {insights.revenue.total.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-gradient-to-br from-green-700 to-green-900 text-white rounded-lg p-4 shadow-md">
          <p className="text-xs opacity-90 mb-1">📈 Profit</p>
          <p className="text-2xl font-bold">Rp {insights.profit.total.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-75 mt-1">Margin: {insights.profit.margin}%</p>
        </div>
        <div className="bg-gradient-to-br from-orange-700 to-orange-900 text-white rounded-lg p-4 shadow-md">
          <p className="text-xs opacity-90 mb-1">💸 Total Expenses</p>
          <p className="text-2xl font-bold">Rp {insights.expenses.total.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-lg p-4 shadow-md">
          <p className="text-xs opacity-90 mb-1">📦 Total Orders</p>
          <p className="text-2xl font-bold">{insights.orders.total}</p>
          <p className="text-xs opacity-75 mt-1">Confirmed + Completed</p>
        </div>
      </div>

      {/* Today & Month Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4">
          <p className="text-xs text-[#722f37] font-semibold">☀️ Hari Ini</p>
          <p className="text-lg font-bold text-[#5a1f2a]">Rp {insights.revenue.today.toLocaleString('id-ID')}</p>
          <p className="text-xs text-[#722f37] mt-1">{insights.orders.today} orders</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4">
          <p className="text-xs text-[#722f37] font-semibold">📅 Bulan Ini</p>
          <p className="text-lg font-bold text-[#5a1f2a]">Rp {insights.revenue.month.toLocaleString('id-ID')}</p>
          <p className="text-xs text-[#722f37] mt-1">{insights.orders.month} orders</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4">
          <p className="text-xs text-[#722f37] font-semibold">🎂 Daily vs Special</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs"><span className="font-semibold">Daily:</span> Rp {insights.revenue.daily.toLocaleString('id-ID')}</p>
            <p className="text-xs"><span className="font-semibold">Special:</span> Rp {insights.revenue.special.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Expenses Breakdown */}
      <div className="bg-white border-2 border-orange-200 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-bold text-orange-800 mb-4">💸 Breakdown Pengeluaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-700">Pembelian Bahan</p>
            <p className="text-2xl font-bold text-orange-800">Rp {insights.expenses.purchase.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-700">Operasional</p>
            <p className="text-2xl font-bold text-orange-800">Rp {insights.expenses.operational.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Sales by Day of Week */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-bold text-blue-800 mb-4">📊 Penjualan per Hari Minggu (30 hari terakhir)</h3>
        <div className="space-y-2">
          {Object.entries(insights.salesByDay).map(([dayNum, amount]) => {
            const dayName = dayNames[dayNum];
            const percentage = maxSalesDay > 0 ? (amount / maxSalesDay) * 100 : 0;
            return (
              <div key={dayNum}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-[#5a1f2a]">{dayName}</span>
                  <span className="text-[#722f37]">Rp {amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-bold text-[#5a1f2a] mb-4">⭐ Top 10 Produk (Revenue)</h3>
        {insights.topProducts.length === 0 ? (
          <p className="text-[#722f37]">Belum ada penjualan</p>
        ) : (
          <div className="space-y-3">
            {insights.topProducts.map((product, idx) => (
              <div key={product.name} className="flex items-center gap-4">
                <span className="text-xl font-bold text-[#5a1f2a] w-8">#{idx + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#5a1f2a]">{product.name}</p>
                  <p className="text-xs text-[#722f37]">{product.qty} terjual</p>
                </div>
                <p className="font-bold text-[#5a1f2a]">Rp {product.revenue.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {insights.lowStockProducts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-bold text-red-800 mb-4">⚠️ Produk Stok Rendah</h3>
          <div className="space-y-3">
            {insights.lowStockProducts.map((product) => (
              <div key={product.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-red-800">{product.name}</p>
                  <p className="text-xs text-red-600">Stok: {product.stock}</p>
                </div>
                <span className="text-2xl">📦</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Carousel */}
      {insights.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-[#5a1f2a] to-[#722f37] rounded-lg p-6 shadow-md text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">💡 Rekomendasi</h3>
            <span className="text-xs opacity-75">{recommendationIndex + 1} / {insights.recommendations.length}</span>
          </div>
          {currentRec && (
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-4xl mb-3">{currentRec.icon}</div>
              <h4 className="text-xl font-bold mb-2">{currentRec.title}</h4>
              <p className="text-base mb-4">{currentRec.message}</p>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  currentRec.type === 'warning'
                    ? 'bg-yellow-300 text-yellow-900'
                    : currentRec.type === 'success'
                    ? 'bg-green-300 text-green-900'
                    : 'bg-blue-300 text-blue-900'
                }`}
              >
                {currentRec.type === 'warning' ? 'Perhatian' : currentRec.type === 'success' ? 'Bagus' : 'Info'}
              </div>
            </div>
          )}
          {insights.recommendations.length > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={prevRecommendation}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-sm font-semibold transition-all"
              >
                ← Sebelumnya
              </button>
              <div className="flex gap-2">
                {insights.recommendations.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === recommendationIndex ? 'bg-white w-6' : 'bg-white bg-opacity-40 w-2'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextRecommendation}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-sm font-semibold transition-all"
              >
                Berikutnya →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
