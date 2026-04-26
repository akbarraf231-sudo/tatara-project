'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (err) throw err;
      setProducts(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
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
      alert('Mohon isi semua field');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
        is_active: formData.is_active,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/products/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token,
          },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token,
          },
          body: JSON.stringify(data),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save product');
      }

      await fetchProducts();
      setShowForm(false);
    } catch (err) {
      alert(err.message);
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

      await fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <div className="text-[#6b4423]">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#6b4423]">🥐 Products ({products.length})</h2>
        <button
          onClick={handleNew}
          className="bg-[#c8794a] hover:bg-[#b6663a] text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm"
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
        <div className="bg-white border-2 border-[#e8d5c4] rounded-lg p-6 space-y-4 shadow-md">
          <h3 className="text-xl font-bold text-[#6b4423]">
            {editingId ? '✏️ Edit Product' : '➕ New Product'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#6b4423] mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Croissant"
                className="w-full border-2 border-[#e8d5c4] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#c8794a] text-[#6b4423]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#6b4423] mb-1">
                Price (Rp) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="25000"
                className="w-full border-2 border-[#e8d5c4] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#c8794a] text-[#6b4423]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#6b4423] mb-1">
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="50"
                className="w-full border-2 border-[#e8d5c4] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#c8794a] text-[#6b4423]"
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
                  className="w-5 h-5 accent-[#c8794a]"
                />
                <span className="text-sm font-semibold text-[#6b4423]">
                  Active (display di website)
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#6b4423] mb-1">
                Image URL (optional)
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://..."
                className="w-full border-2 border-[#e8d5c4] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#c8794a] text-[#6b4423]"
              />
              <p className="text-xs text-[#8b6f47] mt-1">
                Upload gambar ke imgur.com → copy image URL → paste di sini
              </p>
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded border-2 border-[#e8d5c4]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-[#c8794a] hover:bg-[#b6663a] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              💾 Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-[#f7e9d7] hover:bg-[#e8d5c4] text-[#6b4423] font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white border-2 border-[#e8d5c4] rounded-lg p-12 text-center">
          <p className="text-4xl mb-2">🥖</p>
          <p className="text-[#8b6f47]">Belum ada produk. Klik "Add Product" untuk mulai!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border-2 border-[#e8d5c4] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 object-cover bg-[#f7e9d7]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className="font-bold text-[#6b4423] flex-1">{product.name}</h3>
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

                <div className="space-y-1 mb-4 text-sm text-[#6b4423]">
                  <p>
                    <span className="font-semibold">Price:</span>{' '}
                    <span className="text-[#c8794a] font-bold">
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
