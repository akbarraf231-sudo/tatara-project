'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = ['purchase', 'operational', 'other'];

export function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    category: 'purchase',
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
      alert('Deskripsi dan amount wajib');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setForm({
        category: 'purchase',
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
    if (!confirm('Hapus expense ini?')) return;
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

  if (loading) return <div className="text-[#5a1f2a]">Loading expenses...</div>;

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = expenses.filter((e) => e.expense_date === today).reduce((s, e) => s + Number(e.amount), 0);
  const monthStart = today.slice(0, 7) + '-01';
  const monthTotal = expenses.filter((e) => e.expense_date >= monthStart).reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#5a1f2a]">💸 Expenses & Pembelian</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4">
          <p className="text-xs text-[#722f37]">Hari Ini</p>
          <p className="text-2xl font-bold text-[#5a1f2a]">Rp {todayTotal.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4">
          <p className="text-xs text-[#722f37]">Bulan Ini</p>
          <p className="text-2xl font-bold text-[#5a1f2a]">Rp {monthTotal.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4">
          <p className="text-xs text-[#722f37]">Total Tercatat</p>
          <p className="text-2xl font-bold text-[#5a1f2a]">Rp {total.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>}

      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-[#5a1f2a]">+ Catat Pengeluaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Deskripsi (e.g. Beli tepung)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="md:col-span-2 border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
          <input
            type="number"
            placeholder="Amount Rp"
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
            className="md:col-span-3 bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg"
          >
            {saving ? 'Menyimpan...' : '+ Add Expense'}
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#fce8e2]">
            <tr>
              <th className="text-left p-3 text-[#5a1f2a]">Tanggal</th>
              <th className="text-left p-3 text-[#5a1f2a]">Kategori</th>
              <th className="text-left p-3 text-[#5a1f2a]">Deskripsi</th>
              <th className="text-right p-3 text-[#5a1f2a]">Amount</th>
              <th className="text-center p-3 text-[#5a1f2a]"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-6 text-[#722f37]">Belum ada pengeluaran tercatat</td></tr>
            ) : expenses.map((e) => (
              <tr key={e.id} className="border-t border-[#fce8e2]">
                <td className="p-3 text-[#5a1f2a]">{new Date(e.expense_date).toLocaleDateString('id-ID')}</td>
                <td className="p-3 text-[#5a1f2a] capitalize">{e.category}</td>
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
