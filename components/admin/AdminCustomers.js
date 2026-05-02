'use client';

import { useState, useEffect } from 'react';

export function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ unique_customers: 0, repeat_buyers: 0, total_revenue_from_customers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/customers', { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal load customers');
      setCustomers(data.data || []);
      setStats(data.stats || { unique_customers: 0, repeat_buyers: 0, total_revenue_from_customers: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function waLink(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return `https://wa.me/${cleaned}`;
  }

  function copyAllPhones() {
    const phones = filtered.map((c) => c.phone).join('\n');
    navigator.clipboard.writeText(phones);
    alert(`${filtered.length} nomor WA disalin ke clipboard!`);
  }

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('LAPORAN PELANGGAN', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 105, 28, { align: 'center' });
    doc.text(`Total Pelanggan Unik: ${stats.unique_customers}`, 105, 34, { align: 'center' });

    autoTable(doc, {
      startY: 42,
      head: [['Nama', 'No WhatsApp', 'Order', 'Total Belanja', 'Order Terakhir']],
      body: filtered.map((c) => [
        c.name,
        c.phone,
        `${c.paid_orders}/${c.total_orders}`,
        `Rp ${c.total_spent.toLocaleString('id-ID')}`,
        new Date(c.last_order_at).toLocaleDateString('id-ID'),
      ]),
      headStyles: { fillColor: [90, 31, 42], textColor: 255, fontStyle: 'bold' },
      theme: 'striped',
      styles: { fontSize: 8 },
    });

    doc.save(`pelanggan-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  const filtered = customers
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'spent') return b.total_spent - a.total_spent;
      if (sortBy === 'orders') return b.paid_orders - a.paid_orders;
      return new Date(b.last_order_at) - new Date(a.last_order_at);
    });

  if (loading) return <div className="text-[#5a1f2a]">Loading customers...</div>;
  if (error) return <div className="text-red-700 bg-red-50 p-3 rounded">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5a1f2a]">👥 Pelanggan</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-5 shadow-md">
          <p className="text-xs text-[#722f37] font-semibold mb-1">PELANGGAN UNIK</p>
          <p className="text-3xl font-bold text-[#5a1f2a]">{stats.unique_customers}</p>
          <p className="text-xs text-[#722f37] mt-1">berdasarkan no WA berbeda</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-5 shadow-md">
          <p className="text-xs text-[#722f37] font-semibold mb-1">PELANGGAN BERULANG</p>
          <p className="text-3xl font-bold text-green-700">{stats.repeat_buyers}</p>
          <p className="text-xs text-[#722f37] mt-1">order ≥ 2 kali (loyal customer)</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-5 shadow-md">
          <p className="text-xs text-[#722f37] font-semibold mb-1">TOTAL DARI PELANGGAN</p>
          <p className="text-2xl font-bold text-[#5a1f2a]">Rp {stats.total_revenue_from_customers.toLocaleString('id-ID')}</p>
          <p className="text-xs text-[#722f37] mt-1">akumulasi semua transaksi</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="🔍 Cari nama / no WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a] font-semibold"
          >
            <option value="recent">📅 Order Terakhir</option>
            <option value="spent">💰 Total Belanja</option>
            <option value="orders">📦 Jumlah Order</option>
          </select>
          <button
            onClick={copyAllPhones}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
            title="Copy semua no WA hasil filter"
          >
            📋 Copy WA
          </button>
          <button
            onClick={exportPDF}
            className="bg-[#5a1f2a] hover:bg-[#722f37] text-white font-semibold py-2 px-4 rounded-lg"
          >
            📄 Export PDF
          </button>
        </div>
        <p className="text-xs text-[#722f37] mt-2">Menampilkan {filtered.length} dari {customers.length} pelanggan</p>
      </div>

      {/* Customer List */}
      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-8 text-center text-[#722f37]">
          Belum ada pelanggan
        </div>
      ) : (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#5a1f2a] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">No WA</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase">Order</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase">Total Belanja</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Terakhir</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3b9b9]">
                {filtered.map((c) => (
                  <tr key={c.phone} className="hover:bg-[#fce8e2]">
                    <td className="px-4 py-3 font-semibold text-[#5a1f2a]">
                      {c.name}
                      {c.paid_orders >= 2 && (
                        <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">
                          ⭐ LOYAL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#722f37] font-mono text-sm">{c.phone}</td>
                    <td className="px-4 py-3 text-center text-[#5a1f2a]">
                      <span className="font-bold">{c.paid_orders}</span>
                      <span className="text-xs text-[#722f37]">/{c.total_orders}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#5a1f2a]">
                      Rp {c.total_spent.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#722f37]">
                      {new Date(c.last_order_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={waLink(c.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-1.5 px-3 rounded-lg text-xs"
                      >
                        💬 Chat WA
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
