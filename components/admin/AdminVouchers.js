'use client';

import { useState, useEffect } from 'react';

const EMPTY = {
  code: '',
  description: '',
  discount_type: 'amount',
  discount_value: '',
  min_order: '',
  max_uses: '',
  is_active: true,
  expires_at: '',
};

export function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVouchers(); }, []);

  async function fetchVouchers() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/vouchers', { headers: { 'x-admin-token': token } });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setVouchers(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function handleEdit(v) {
    setEditingId(v.id);
    setForm({
      code: v.code,
      description: v.description || '',
      discount_type: v.discount_type,
      discount_value: v.discount_value.toString(),
      min_order: v.min_order?.toString() || '0',
      max_uses: v.max_uses?.toString() || '',
      is_active: v.is_active,
      expires_at: v.expires_at ? v.expires_at.slice(0, 10) : '',
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.discount_value) {
      alert('Code dan discount value wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingId ? `/api/admin/vouchers/${editingId}` : '/api/admin/vouchers';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          ...form,
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);
      setShowForm(false);
      fetchVouchers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus voucher ini?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      if (!res.ok) throw new Error('Failed');
      fetchVouchers();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-[#5a1f2a]">Loading vouchers...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#5a1f2a]">🎟️ Vouchers ({vouchers.length})</h2>
        <button
          onClick={handleNew}
          className="bg-[#5a1f2a] hover:bg-[#722f37] text-white font-semibold py-2 px-6 rounded-full transition-colors shadow-sm"
        >
          + Add Voucher
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>}

      {showForm && (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 shadow-md space-y-4">
          <h3 className="text-xl font-bold text-[#5a1f2a]">{editingId ? 'Edit Voucher' : 'New Voucher'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Kode * (otomatis uppercase)</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="HEMAT8K"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a] uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Promo lebaran"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Type *</label>
              <div className="flex gap-2">
                {['amount', 'percent'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, discount_type: t })}
                    className={`flex-1 py-2 rounded-lg border-2 font-semibold ${
                      form.discount_type === t ? 'bg-[#5a1f2a] text-white border-[#5a1f2a]' : 'bg-white text-[#5a1f2a] border-[#e3b9b9]'
                    }`}
                  >
                    {t === 'amount' ? 'Rp Amount' : '% Persen'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">
                Value * ({form.discount_type === 'percent' ? '%' : 'Rp'})
              </label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === 'percent' ? '10' : '8000'}
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Min Order (Rp)</label>
              <input
                type="number"
                value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                placeholder="0"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Max Uses (kosongkan = unlimited)</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                placeholder="100"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Expires At (opsional)</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-5 h-5 accent-[#5a1f2a]"
                />
                <span className="text-sm font-semibold text-[#5a1f2a]">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg">
              {saving ? 'Menyimpan...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-[#fce8e2] hover:bg-[#e3b9b9] text-[#5a1f2a] font-semibold py-2 px-6 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {vouchers.length === 0 ? (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-12 text-center">
          <p className="text-4xl mb-2">🎟️</p>
          <p className="text-[#722f37]">Belum ada voucher.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((v) => (
            <div key={v.id} className="bg-white border-2 border-[#e3b9b9] rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono font-bold text-lg text-[#5a1f2a]">{v.code}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${v.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {v.is_active ? 'Active' : 'Off'}
                </span>
              </div>
              {v.description && <p className="text-sm text-[#722f37] mb-2">{v.description}</p>}
              <p className="text-2xl font-bold text-[#5a1f2a] mb-2">
                {v.discount_type === 'percent'
                  ? `${v.discount_value}%`
                  : `Rp ${Number(v.discount_value).toLocaleString('id-ID')}`}
              </p>
              <div className="text-xs text-[#722f37] space-y-1 mb-3">
                {Number(v.min_order) > 0 && <p>Min order: Rp {Number(v.min_order).toLocaleString('id-ID')}</p>}
                <p>Used: {v.used_count}{v.max_uses ? ` / ${v.max_uses}` : ' (unlimited)'}</p>
                {v.expires_at && <p>Expires: {new Date(v.expires_at).toLocaleDateString('id-ID')}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(v)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-1.5 rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(v.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1.5 rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
