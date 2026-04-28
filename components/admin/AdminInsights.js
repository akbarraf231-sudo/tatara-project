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

  const exportToPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString('id-ID');
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('LAPORAN INSIGHTS', 105, yPos, { align: 'center' });
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${timestamp}`, 105, yPos, { align: 'center' });
    yPos += 12;

    // Revenue Summary
    autoTable(doc, {
      startY: yPos,
      head: [['RINGKASAN REVENUE', 'JUMLAH']],
      body: [
        ['Total Revenue', `Rp ${insights.revenue.total.toLocaleString('id-ID')}`],
        ['Revenue Hari Ini', `Rp ${insights.revenue.today.toLocaleString('id-ID')}`],
        ['Revenue Bulan Ini', `Rp ${insights.revenue.month.toLocaleString('id-ID')}`],
        ['Revenue Daily Products', `Rp ${insights.revenue.daily.toLocaleString('id-ID')}`],
        ['Revenue Special Products', `Rp ${insights.revenue.special.toLocaleString('id-ID')}`],
      ],
      headStyles: { fillColor: [90, 31, 42], textColor: 255, fontStyle: 'bold' },
      theme: 'striped',
    });
    yPos = doc.lastAutoTable.finalY + 8;

    // Expenses & Profit
    autoTable(doc, {
      startY: yPos,
      head: [['EXPENSES & PROFIT', 'JUMLAH']],
      body: [
        ['Total Expenses', `Rp ${insights.expenses.total.toLocaleString('id-ID')}`],
        ['Total Profit', `Rp ${insights.profit.total.toLocaleString('id-ID')}`],
        ['Profit Margin', `${insights.profit.margin}%`],
        ['Total Orders', `${insights.orders.total}`],
      ],
      headStyles: { fillColor: [21, 128, 61], textColor: 255, fontStyle: 'bold' },
      theme: 'striped',
    });
    yPos = doc.lastAutoTable.finalY + 8;

    // Top Products
    if (insights.topProducts.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['TOP PRODUCTS - Nama', 'Qty', 'Revenue']],
        body: insights.topProducts.map((p) => [
          p.name,
          p.qty.toString(),
          `Rp ${p.revenue.toLocaleString('id-ID')}`,
        ]),
        headStyles: { fillColor: [194, 65, 12], textColor: 255, fontStyle: 'bold' },
        theme: 'striped',
      });
      yPos = doc.lastAutoTable.finalY + 8;
    }

    // Low Stock Products
    if (insights.lowStockProducts.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['LOW STOCK - Produk', 'Stok', 'Threshold']],
        body: insights.lowStockProducts.map((p) => [
          p.name,
          p.stock.toString(),
          p.threshold.toString(),
        ]),
        headStyles: { fillColor: [185, 28, 28], textColor: 255, fontStyle: 'bold' },
        theme: 'striped',
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Sinar Jaya Bakery - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`insights-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#5a1f2a]">📊 Business Intelligence</h2>
        <button
          onClick={exportToPDF}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          📄 Export PDF
        </button>
      </div>

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
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-[#5a1f2a]">💡 Rekomendasi</h3>
            <span className="text-xs text-[#722f37] font-semibold">{recommendationIndex + 1} / {insights.recommendations.length}</span>
          </div>
          {currentRec && (
            <div className={`rounded-2xl p-5 shadow-md border-l-8 ${
              currentRec.type === 'warning'
                ? 'bg-yellow-50 border-yellow-400'
                : currentRec.type === 'success'
                ? 'bg-green-50 border-green-400'
                : 'bg-blue-50 border-blue-400'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`text-5xl p-3 rounded-2xl ${
                  currentRec.type === 'warning'
                    ? 'bg-yellow-100'
                    : currentRec.type === 'success'
                    ? 'bg-green-100'
                    : 'bg-blue-100'
                }`}>
                  {currentRec.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xl font-bold text-gray-900">{currentRec.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      currentRec.type === 'warning'
                        ? 'bg-yellow-200 text-yellow-800'
                        : currentRec.type === 'success'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {currentRec.type === 'warning' ? '⚠️ Perhatian' : currentRec.type === 'success' ? '✅ Bagus' : 'ℹ️ Info'}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-gray-800 leading-relaxed">{currentRec.message}</p>
                </div>
              </div>
            </div>
          )}
          {insights.recommendations.length > 1 && (
            <div className="flex justify-between items-center mt-3">
              <button
                onClick={prevRecommendation}
                className="bg-[#fce8e2] hover:bg-[#e3b9b9] text-[#5a1f2a] px-4 py-2 rounded-full text-sm font-semibold transition-all"
              >
                ← Sebelumnya
              </button>
              <div className="flex gap-2">
                {insights.recommendations.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === recommendationIndex ? 'bg-[#5a1f2a] w-6' : 'bg-[#e3b9b9] w-2'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextRecommendation}
                className="bg-[#fce8e2] hover:bg-[#e3b9b9] text-[#5a1f2a] px-4 py-2 rounded-full text-sm font-semibold transition-all"
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
