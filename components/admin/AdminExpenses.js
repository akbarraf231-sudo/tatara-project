'use client';

import { useState, useEffect } from 'react';

export function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('purchase');
  const [form, setForm] = useState({
    description: '',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchExpenses(); }, []);

  async function fetchExpenses() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/expenses', { headers: { 'x-admin-token': token } });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setExpenses(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.description.trim() || !form.amount) {
      alert('Deskripsi dan jumlah wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ ...form, category: activeTab }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setForm({
        description: '',
        amount: '',
        expense_date: new Date().toISOString().slice(0, 10),
      });
      fetchExpenses();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus catatan ini?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      fetchExpenses();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-[#5a1f2a]">Loading...</div>;

  // Filter by active tab category
  const tabConfig = {
    purchase: { label: 'Pembelian', icon: '🛒', placeholder: 'Beli tepung, telur, gula...' },
    operational: { label: 'Pengeluaran', icon: '💸', placeholder: 'Gaji, listrik, sewa...' },
  };

  const filtered = expenses.filter((e) => {
    if (activeTab === 'purchase') return e.category === 'purchase';
    return e.category !== 'purchase'; // operational + other
  });

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = filtered.filter((e) => e.expense_date === today).reduce((s, e) => s + Number(e.amount), 0);
  const monthStart = today.slice(0, 7) + '-01';
  const monthTotal = filtered.filter((e) => e.expense_date >= monthStart).reduce((s, e) => s + Number(e.amount), 0);

  const cfg = tabConfig[activeTab];

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-[#5a1f2a]">💰 Catatan Keuangan</h2>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white border-2 border-[#e3b9b9] rounded-lg p-1">
        {Object.entries(tabConfig).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
              activeTab === key
                ? 'bg-[#5a1f2a] text-white shadow'
                : 'bg-transparent text-[#5a1f2a] hover:bg-[#fce8e2]'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-3 sm:p-4">
          <p className="text-xs text-[#722f37]">Hari Ini ({cfg.label})</p>
          <p className="text-lg sm:text-2xl font-bold text-[#5a1f2a]">Rp {todayTotal.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-3 sm:p-4">
          <p className="text-xs text-[#722f37]">Bulan Ini ({cfg.label})</p>
          <p className="text-lg sm:text-2xl font-bold text-[#5a1f2a]">Rp {monthTotal.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-3 sm:p-4">
          <p className="text-xs text-[#722f37]">Total {cfg.label}</p>
          <p className="text-lg sm:text-2xl font-bold text-[#5a1f2a]">Rp {total.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>}

      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4 sm:p-6 space-y-3">
        <h3 className="font-bold text-[#5a1f2a]">+ Catat {cfg.label}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder={`Deskripsi (e.g. ${cfg.placeholder})`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="sm:col-span-2 border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Jumlah Rp"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
          <input
            type="date"
            value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
            className="border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="sm:col-span-2 bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg"
          >
            {saving ? 'Menyimpan...' : `+ Tambah ${cfg.label}`}
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg overflow-hidden">
        {/* Mobile: Card list, Desktop: Table */}
        <div className="block sm:hidden divide-y divide-[#fce8e2]">
          {filtered.length === 0 ? (
            <p className="text-center p-6 text-[#722f37]">Belum ada catatan {cfg.label.toLowerCase()}</p>
          ) : filtered.map((e) => (
            <div key={e.id} className="p-3 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#5a1f2a] text-sm break-words">{e.description}</p>
                <p className="text-xs text-[#722f37]">{new Date(e.expense_date).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-[#5a1f2a] text-sm">Rp {Number(e.amount).toLocaleString('id-ID')}</p>
                <button onClick={() => handleDelete(e.id)} className="text-red-600 text-xs">🗑️ Hapus</button>
              </div>
            </div>
          ))}
        </div>
        <table className="w-full text-sm hidden sm:table">
          <thead className="bg-[#fce8e2]">
            <tr>
              <th className="text-left p-3 text-[#5a1f2a]">Tanggal</th>
              <th className="text-left p-3 text-[#5a1f2a]">Deskripsi</th>
              <th className="text-right p-3 text-[#5a1f2a]">Jumlah</th>
              <th className="text-center p-3 text-[#5a1f2a]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-6 text-[#722f37]">Belum ada catatan {cfg.label.toLowerCase()}</td></tr>
            ) : filtered.map((e) => (
              <tr key={e.id} className="border-t border-[#fce8e2]">
                <td className="p-3 text-[#5a1f2a]">{new Date(e.expense_date).toLocaleDateString('id-ID')}</td>
                <td className="p-3 text-[#5a1f2a]">{e.description}</td>
                <td className="p-3 text-right text-[#5a1f2a] font-semibold">Rp {Number(e.amount).toLocaleString('id-ID')}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:text-red-800 font-semibold">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
