'use client';

import { useState, useEffect } from 'react';

export function AdminInventory() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchInventory() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/inventory-analysis', {
        headers: { 'x-admin-token': token },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Gagal load inventory');
      setInventory(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-[#5a1f2a]">Loading inventory...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>;
  if (!inventory) return null;

  const filteredProducts =
    filterStatus === 'all'
      ? inventory.productStats
      : inventory.productStats.filter((p) => p.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'outofstock':
        return 'bg-red-50 border-red-200';
      case 'low':
        return 'bg-yellow-50 border-yellow-200';
      case 'normal':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'outofstock':
        return { text: 'Habis', color: 'bg-red-100 text-red-800' };
      case 'low':
        return { text: 'Rendah', color: 'bg-yellow-100 text-yellow-800' };
      case 'normal':
        return { text: 'Normal', color: 'bg-green-100 text-green-800' };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5a1f2a]">📦 Smart Inventory Helper</h2>

      {/* Alerts */}
      {inventory.alerts.length > 0 && (
        <div className="space-y-3">
          {inventory.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 flex items-center gap-3 ${
                alert.type === 'critical'
                  ? 'bg-red-50 border-2 border-red-200'
                  : 'bg-yellow-50 border-2 border-yellow-200'
              }`}
            >
              <span className="text-2xl">{alert.icon}</span>
              <div className="flex-1">
                <p className={`font-bold ${alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'}`}>
                  {alert.title}
                </p>
                <p className={`text-sm ${alert.type === 'critical' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {alert.message}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                alert.type === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
              }`}>
                {alert.count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#5a1f2a] to-[#722f37] text-white rounded-lg p-4 shadow-md">
          <p className="text-xs opacity-90 mb-1">📊 Total Produk</p>
          <p className="text-2xl font-bold">{inventory.summary.totalProducts}</p>
        </div>
        <div className="bg-gradient-to-br from-green-700 to-green-900 text-white rounded-lg p-4 shadow-md">
          <p className="text-xs opacity-90 mb-1">✅ Stock Normal</p>
          <p className="text-2xl font-bold">
            {inventory.summary.totalProducts - inventory.summary.lowStockCount - inventory.summary.outOfStockCount}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-700 to-yellow-900 text-white rounded-lg p-4 shadow-md">
          <p className="text-xs opacity-90 mb-1">⚠️ Stock Rendah</p>
          <p className="text-2xl font-bold">{inventory.summary.lowStockCount}</p>
        </div>
        <div className="bg-gradient-to-br from-red-700 to-red-900 text-white rounded-lg p-4 shadow-md">
          <p className="text-xs opacity-90 mb-1">🚨 Habis</p>
          <p className="text-2xl font-bold">{inventory.summary.outOfStockCount}</p>
        </div>
      </div>

      {/* Purchase Insights */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-bold text-blue-800 mb-4">💳 Belanja Bahan (30 Hari)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-blue-900">Rp {inventory.summary.purchaseExpensesLast30.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">Qty Dibeli</p>
            <p className="text-2xl font-bold text-blue-900">{Math.round(inventory.summary.purchaseQuantityLast30)} unit</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">Harga Per Unit</p>
            <p className="text-2xl font-bold text-blue-900">Rp {Number(inventory.summary.avgPricePerUnit).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Stock Predictions */}
      {inventory.predictions.length > 0 && (
        <div className="bg-white border-2 border-orange-200 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-bold text-orange-800 mb-4">⏰ Prediksi Stok Habis</h3>
          <div className="space-y-3">
            {inventory.predictions.slice(0, 5).map((pred) => {
              const urgencyColor =
                pred.urgency === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : pred.urgency === 'high'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-yellow-50 border-yellow-200';
              return (
                <div key={pred.productId} className={`border-2 rounded-lg p-4 ${urgencyColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-[#5a1f2a]">{pred.productName}</p>
                      <p className="text-xs text-[#722f37]">Stok: {pred.stock} | Penjualan rata-rata: {pred.avgDailySales}/hari</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      pred.urgency === 'critical'
                        ? 'bg-red-200 text-red-800'
                        : pred.urgency === 'high'
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {pred.daysUntilEmpty} hari lagi
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-orange-600 transition-all"
                      style={{ width: `${Math.min(100, (pred.daysUntilEmpty / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Status Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filterStatus === 'all'
              ? 'bg-[#5a1f2a] text-white'
              : 'bg-white border-2 border-[#e3b9b9] text-[#5a1f2a] hover:border-[#5a1f2a]'
          }`}
        >
          Semua ({inventory.productStats.length})
        </button>
        <button
          onClick={() => setFilterStatus('normal')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filterStatus === 'normal'
              ? 'bg-green-600 text-white'
              : 'bg-white border-2 border-green-200 text-green-700 hover:border-green-600'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setFilterStatus('low')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filterStatus === 'low'
              ? 'bg-yellow-600 text-white'
              : 'bg-white border-2 border-yellow-200 text-yellow-700 hover:border-yellow-600'
          }`}
        >
          Rendah
        </button>
        <button
          onClick={() => setFilterStatus('outofstock')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filterStatus === 'outofstock'
              ? 'bg-red-600 text-white'
              : 'bg-white border-2 border-red-200 text-red-700 hover:border-red-600'
          }`}
        >
          Habis
        </button>
      </div>

      {/* Product Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const badge = getStatusBadge(product.status);
          const colors = getStatusColor(product.status);
          const percentage = (product.stock / Math.max(product.threshold * 2, 1)) * 100;
          return (
            <div key={product.id} className={`border-2 rounded-lg p-4 shadow-md ${colors}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-[#5a1f2a]">{product.name}</p>
                  <p className="text-xs text-[#722f37]">{product.price.toLocaleString('id-ID')} / {product.unit}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${badge.color}`}>{badge.text}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Stok: {product.stock}</span>
                  <span className="text-xs text-gray-600">Min: {product.threshold}</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      product.status === 'outofstock'
                        ? 'bg-red-500'
                        : product.status === 'low'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">Terjual: {product.totalSold} unit</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
