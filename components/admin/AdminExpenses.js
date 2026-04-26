'use client';

import { useState, useEffect } from 'react';

const EMPTY_TOTALS = {
  purchase: { total: 0, today: 0, month: 0 },
  operational: { total: 0, today: 0, month: 0 },
  all: { total: 0, today: 0, month: 0 },
};

export function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState(EMPTY_TOTALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('purchase');
  const [purchaseForm, setPurchaseForm] = useState({
    description: '',
    quantity: '',
    unit_price: '',
    expense_date: new Date().toISOString().slice(0, 10),
  });
  const [operationalForm, setOperationalForm] = useState({
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
      setTotals(result.totals || EMPTY_TOTALS);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPurchase() {
    if (!purchaseForm.description.trim()) {
      alert('Deskripsi wajib diisi');
      return;
    }
    if (!purchaseForm.quantity || Number(purchaseForm.quantity) <= 0) {
      alert('Quantity harus lebih dari 0');
      return;
    }
    if (purchaseForm.unit_price === '' || Number(purchaseForm.unit_price) < 0) {
      alert('Unit price tidak valid');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          category: 'purchase',
          description: purchaseForm.description,
          quantity: purchaseForm.quantity,
          unit_price: purchaseForm.unit_price,
          expense_date: purchaseForm.expense_date,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setPurchaseForm({
        description: '',
        quantity: '',
        unit_price: '',
        expense_date: new Date().toISOString().slice(0, 10),
      });
      fetchExpenses();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddOperational() {
    if (!operationalForm.description.trim() || !operationalForm.amount) {
      alert('Deskripsi dan jumlah wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          category: 'operational',
          description: operationalForm.description,
          amount: operationalForm.amount,
          expense_date: operationalForm.expense_date,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setOperationalForm({
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

  const tabConfig = {
    purchase: { label: 'Pembelian', icon: '🛒', placeholder: 'Beli tepung, telur, gula...' },
    operational: { label: 'Pengeluaran', icon: '💸', placeholder: 'Gaji, listrik, sewa...' },
  };

  const filtered = expenses.filter((e) => {
    if (activeTab === 'purchase') return e.category === 'purchase';
    return e.category !== 'purchase';
  });

  const tabTotals = totals[activeTab] || { total: 0, today: 0, month: 0 };
  const cfg = tabConfig[activeTab];

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-[#5a1f2a]">💰 Catatan Keuangan</h2>

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
          <p className="text-lg sm:text-2xl font-bold text-[#5a1f2a]">Rp {tabTotals.today.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-3 sm:p-4">
          <p className="text-xs text-[#722f37]">Bulan Ini ({cfg.label})</p>
          <p className="text-lg sm:text-2xl font-bold text-[#5a1f2a]">Rp {tabTotals.month.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-3 sm:p-4">
          <p className="text-xs text-[#722f37]">Total {cfg.label}</p>
          <p className="text-lg sm:text-2xl font-bold text-[#5a1f2a]">Rp {tabTotals.total.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>}

      {activeTab === 'purchase' ? (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4 sm:p-6 space-y-3">
          <h3 className="font-bold text-[#5a1f2a]">+ Catat {cfg.label}</h3>
          <p className="text-xs text-[#722f37]">Subtotal &amp; total dihitung otomatis di server</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={`Deskripsi (e.g. ${cfg.placeholder})`}
              value={purchaseForm.description}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
              className="sm:col-span-2 border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
            />
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="Quantity (e.g. 5)"
              value={purchaseForm.quantity}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
              className="border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
            />
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Unit Price Rp"
              value={purchaseForm.unit_price}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, unit_price: e.target.value })}
              className="border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
            />
            <input
              type="date"
              value={purchaseForm.expense_date}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, expense_date: e.target.value })}
              className="sm:col-span-2 border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
            />
            <button
              onClick={handleAddPurchase}
              disabled={saving}
              className="sm:col-span-2 bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg"
            >
              {saving ? 'Menyimpan...' : `+ Tambah ${cfg.label}`}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4 sm:p-6 space-y-3">
          <h3 className="font-bold text-[#5a1f2a]">+ Catat {cfg.label}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={`Deskripsi (e.g. ${cfg.placeholder})`}
              value={operationalForm.description}
              onChange={(e) => setOperationalForm({ ...operationalForm, description: e.target.value })}
              className="sm:col-span-2 border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Jumlah Rp"
              value={operationalForm.amount}
              onChange={(e) => setOperationalForm({ ...operationalForm, amount: e.target.value })}
              className="border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
            />
            <input
              type="date"
              value={operationalForm.expense_date}
              onChange={(e) => setOperationalForm({ ...operationalForm, expense_date: e.target.value })}
              className="border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
            />
            <button
              onClick={handleAddOperational}
              disabled={saving}
              className="sm:col-span-2 bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg"
            >
              {saving ? 'Menyimpan...' : `+ Tambah ${cfg.label}`}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg overflow-hidden">
        <div className="block sm:hidden divide-y divide-[#fce8e2]">
          {filtered.length === 0 ? (
            <p className="text-center p-6 text-[#722f37]">Belum ada catatan {cfg.label.toLowerCase()}</p>
          ) : filtered.map((e) => (
            <div key={e.id} className="p-3 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#5a1f2a] text-sm break-words">{e.description}</p>
                <p className="text-xs text-[#722f37]">{new Date(e.expense_date).toLocaleDateString('id-ID')}</p>
                {activeTab === 'purchase' && e.quantity != null && e.unit_price != null && (
                  <p className="text-xs text-[#722f37]">
                    {Number(e.quantity).toLocaleString('id-ID')} × Rp {Number(e.unit_price).toLocaleString('id-ID')}
                  </p>
                )}
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
              {activeTab === 'purchase' && (
                <>
                  <th className="text-right p-3 text-[#5a1f2a]">Qty</th>
                  <th className="text-right p-3 text-[#5a1f2a]">Unit Price</th>
                </>
              )}
              <th className="text-right p-3 text-[#5a1f2a]">{activeTab === 'purchase' ? 'Subtotal' : 'Jumlah'}</th>
              <th className="text-center p-3 text-[#5a1f2a]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={activeTab === 'purchase' ? 6 : 4} className="text-center p-6 text-[#722f37]">Belum ada catatan {cfg.label.toLowerCase()}</td></tr>
            ) : filtered.map((e) => (
              <tr key={e.id} className="border-t border-[#fce8e2]">
                <td className="p-3 text-[#5a1f2a]">{new Date(e.expense_date).toLocaleDateString('id-ID')}</td>
                <td className="p-3 text-[#5a1f2a]">{e.description}</td>
                {activeTab === 'purchase' && (
                  <>
                    <td className="p-3 text-right text-[#5a1f2a]">{e.quantity != null ? Number(e.quantity).toLocaleString('id-ID') : '—'}</td>
                    <td className="p-3 text-right text-[#5a1f2a]">{e.unit_price != null ? `Rp ${Number(e.unit_price).toLocaleString('id-ID')}` : '—'}</td>
                  </>
                )}
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
