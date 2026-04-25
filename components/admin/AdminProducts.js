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
      is_active: true,
    });
    setShowForm(true);
  }

  async function handleSave() {
    try {
      const token = localStorage.getItem('adminToken');
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
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
        throw new Error('Failed to save product');
      }

      await fetchProducts();
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;

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
    return <div className="text-amber-700">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-900">Products</h2>
        <button
          onClick={handleNew}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
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
        <div className="bg-white border-2 border-amber-200 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-amber-900">
            {editingId ? 'Edit Product' : 'New Product'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border-2 border-amber-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Price (Rp)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full border-2 border-amber-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full border-2 border-amber-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-amber-900">
                  Active
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <p className="text-amber-700">No products yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border-2 border-amber-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-amber-900 flex-1">{product.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm text-amber-900">
                <p>
                  <span className="font-semibold">Price:</span> Rp{' '}
                  {product.price.toLocaleString('id-ID')}
                </p>
                <p>
                  <span className="font-semibold">Stock:</span> {product.stock}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition-colors"
                >
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
