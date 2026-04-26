'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ImageUpload } from '@/components/ImageUpload';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/products', {
        headers: { 'x-admin-token': token },
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal load products');
      }
      setProducts(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setFormMessage(null);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || '',
      is_active: product.is_active,
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditingId(null);
    setFormMessage(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      image_url: '',
      is_active: true,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.price || !formData.stock) {
      setFormMessage({ type: 'error', text: 'Mohon isi Name, Price, dan Stock' });
      return;
    }

    setSaving(true);
    setFormMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
        is_active: formData.is_active,
      };

      const url = editingId
        ? `/api/admin/products/${editingId}`
        : '/api/admin/products';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal menyimpan produk');
      }

      // Optimistic local update so it works even if anon SELECT is blocked by RLS
      if (editingId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...result.data } : p))
        );
      } else if (result.data) {
        setProducts((prev) => [...prev, result.data]);
      }

      // Also try to refetch in case RLS is configured properly
      fetchProducts();

      setFormMessage({
        type: 'success',
        text: editingId ? '✅ Produk berhasil di-update!' : '✅ Produk berhasil ditambahkan!',
      });
      setTimeout(() => {
        setShowForm(false);
        setFormMessage(null);
      }, 1200);
    } catch (err) {
      setFormMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus produk ini?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      // Optimistic remove
      setProducts((prev) => prev.filter((p) => p.id !== id));
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <div className="text-[#5a1f2a]">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#5a1f2a]">🥐 Products ({products.length})</h2>
        <button
          onClick={handleNew}
          className="bg-[#5a1f2a] hover:bg-[#722f37] text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 space-y-4 shadow-md">
          <h3 className="text-xl font-bold text-[#5a1f2a]">
            {editingId ? '✏️ Edit Product' : '➕ New Product'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Croissant"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">
                Price (Rp) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="25000"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="50"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#5a1f2a]"
                />
                <span className="text-sm font-semibold text-[#5a1f2a]">
                  Active (display di website)
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <ImageUpload
                label="Gambar Produk (optional)"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>
          </div>

          {formMessage && (
            <div
              className={`p-3 rounded-lg ${
                formMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {formMessage.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {saving ? '⏳ Menyimpan...' : '💾 Save'}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormMessage(null); }}
              disabled={saving}
              className="bg-[#fce8e2] hover:bg-[#e3b9b9] text-[#5a1f2a] font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-12 text-center">
          <p className="text-4xl mb-2">🥖</p>
          <p className="text-[#722f37]">Belum ada produk. Klik "Add Product" untuk mulai!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border-2 border-[#e3b9b9] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 object-cover bg-[#fce8e2]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className="font-bold text-[#5a1f2a] flex-1">{product.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.is_active ? '✓' : '✗'}
                  </span>
                </div>

                <div className="space-y-1 mb-4 text-sm text-[#5a1f2a]">
                  <p>
                    <span className="font-semibold">Price:</span>{' '}
                    <span className="text-[#5a1f2a] font-bold">
                      Rp {Number(product.price).toLocaleString('id-ID')}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Stock:</span>{' '}
                    <span className={product.stock > 0 ? '' : 'text-red-600 font-bold'}>
                      {product.stock} {product.stock > 0 ? '' : '(Habis!)'}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition-colors text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
