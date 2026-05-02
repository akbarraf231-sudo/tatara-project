'use client';

import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';

const EMPTY_FORM = {
  name: '',
  price: '',
  stock: '',
  image_url: '',
  image_url_2: '',
  image_url_3: '',
  is_active: true,
  product_type: 'daily',
  description: '',
  flavors: [],
  sizes: [],
  max_flavors_selectable: 1,
  flavor_stocks: {}, // { "Cokelat": 10, "Vanilla": 5 }
};

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [flavorInput, setFlavorInput] = useState('');
  const [sizeNameInput, setSizeNameInput] = useState('');
  const [sizePriceInput, setSizePriceInput] = useState('');

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
      if (!res.ok || !result.success) throw new Error(result.error || 'Gagal load products');
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
    const flavorStockMap = {};
    for (const fs of product.flavor_stocks || []) flavorStockMap[fs.flavor] = fs.stock;
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || '',
      image_url_2: product.image_url_2 || '',
      image_url_3: product.image_url_3 || '',
      is_active: product.is_active,
      product_type: product.product_type || 'daily',
      description: product.description || '',
      flavors: Array.isArray(product.flavors) ? product.flavors : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      max_flavors_selectable: product.max_flavors_selectable || 1,
      flavor_stocks: flavorStockMap,
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditingId(null);
    setFormMessage(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  }

  function addFlavor() {
    const v = flavorInput.trim();
    if (!v) return;
    if (formData.flavors.includes(v)) {
      setFlavorInput('');
      return;
    }
    setFormData({
      ...formData,
      flavors: [...formData.flavors, v],
      flavor_stocks: { ...formData.flavor_stocks, [v]: 0 },
    });
    setFlavorInput('');
  }

  function removeFlavor(idx) {
    const removed = formData.flavors[idx];
    const newStocks = { ...formData.flavor_stocks };
    delete newStocks[removed];
    setFormData({
      ...formData,
      flavors: formData.flavors.filter((_, i) => i !== idx),
      flavor_stocks: newStocks,
    });
  }

  function setFlavorStock(flavor, value) {
    const n = parseInt(value, 10);
    setFormData({
      ...formData,
      flavor_stocks: {
        ...formData.flavor_stocks,
        [flavor]: Number.isFinite(n) && n >= 0 ? n : 0,
      },
    });
  }

  function addSize() {
    const n = sizeNameInput.trim();
    if (!n) return;
    const p = sizePriceInput ? parseFloat(sizePriceInput) : 0;
    setFormData({ ...formData, sizes: [...formData.sizes, { name: n, price: p }] });
    setSizeNameInput('');
    setSizePriceInput('');
  }

  function removeSize(idx) {
    setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== idx) });
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
      const flavorStocksPayload = formData.flavors.map((f) => ({
        flavor: f,
        stock: Number.isFinite(parseInt(formData.flavor_stocks?.[f], 10))
          ? parseInt(formData.flavor_stocks[f], 10)
          : 0,
      }));
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
        image_url_2: formData.image_url_2 || null,
        image_url_3: formData.image_url_3 || null,
        is_active: formData.is_active,
        product_type: formData.product_type,
        description: formData.description,
        flavors: formData.flavors,
        sizes: formData.sizes,
        max_flavors_selectable: parseInt(formData.max_flavors_selectable) || 1,
        flavor_stocks: flavorStocksPayload,
      };
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Gagal menyimpan produk');

      // Refresh list from server to ensure consistency, no double-update flicker
      await fetchProducts();

      setFormMessage({
        type: 'success',
        text: editingId ? 'Produk berhasil di-update!' : 'Produk berhasil ditambahkan!',
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
        headers: { 'x-admin-token': token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal hapus produk');
      if (data.softDeleted) {
        alert('Produk ini punya riwayat order sehingga tidak bisa dihapus permanen.\nProduk sudah dinonaktifkan — tidak akan muncul ke customer.');
      }
      await fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="text-[#5a1f2a]">Loading products...</div>;

  const filtered = filter === 'all' ? products : products.filter((p) => (p.product_type || 'daily') === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#5a1f2a]">🥐 Products ({products.length})</h2>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'daily', label: '☀️ Daily' },
            { id: 'special', label: '🎂 Special' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                filter === t.id ? 'bg-[#5a1f2a] text-white' : 'bg-[#fce8e2] text-[#5a1f2a] hover:bg-[#e3b9b9]'
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={handleNew}
            className="bg-[#5a1f2a] hover:bg-[#722f37] text-white font-semibold py-2 px-6 rounded-full transition-colors shadow-sm"
          >
            + Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>
      )}

      {showForm && (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 space-y-4 shadow-md">
          <h3 className="text-xl font-bold text-[#5a1f2a]">
            {editingId ? 'Edit Product' : 'New Product'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Type *</label>
              <div className="flex gap-2">
                {['daily', 'special'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData({ ...formData, product_type: t })}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 font-semibold capitalize transition-colors ${
                      formData.product_type === t
                        ? 'bg-[#5a1f2a] text-white border-[#5a1f2a]'
                        : 'bg-white text-[#5a1f2a] border-[#e3b9b9]'
                    }`}
                  >
                    {t === 'daily' ? '☀️ Daily' : '🎂 Special'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#722f37] mt-1">
                Daily = same-day pickup, Special = pre-order H-N
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Croissant"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Price (Rp) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="25000"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Stock *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 accent-[#5a1f2a]"
                />
                <span className="text-sm font-semibold text-[#5a1f2a]">Active</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi produk..."
                rows={2}
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-2">Varian Rasa</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={flavorInput}
                  onChange={(e) => setFlavorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
                  placeholder="e.g. Cokelat"
                  className="flex-1 border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
                />
                <button
                  onClick={addFlavor}
                  className="bg-[#5a1f2a] text-white px-4 py-2 rounded-lg font-semibold"
                >
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.flavors.map((f, i) => (
                  <span key={i} className="bg-[#fce8e2] text-[#5a1f2a] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {f}
                    <button onClick={() => removeFlavor(i)} className="font-bold">×</button>
                  </span>
                ))}
              </div>

              {formData.flavors.length > 0 && (
                <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-3 mb-3">
                  <label className="block text-sm font-semibold text-[#5a1f2a] mb-2">
                    📦 Stok Per Varian Rasa
                  </label>
                  <p className="text-xs text-[#722f37] mb-2">
                    Atur stok terpisah untuk setiap rasa. Saat stok rasa = 0, varian akan otomatis ditandai "Habis" dan tidak bisa dipilih customer.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.flavors.map((f) => {
                      const val = formData.flavor_stocks?.[f] ?? 0;
                      const out = !val;
                      return (
                        <div key={f} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                          out ? 'bg-red-50 border border-red-200' : 'bg-[#fce8e2]'
                        }`}>
                          <span className="flex-1 text-sm font-semibold text-[#5a1f2a] truncate">{f}</span>
                          <input
                            type="number"
                            min="0"
                            value={val}
                            onChange={(e) => setFlavorStock(f, e.target.value)}
                            className="w-20 border-2 border-[#e3b9b9] rounded-lg py-1 px-2 text-[#5a1f2a] text-sm text-center"
                          />
                          {out && <span className="text-[10px] font-bold text-red-700">Habis</span>}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#722f37] mt-2">
                    Total stok semua rasa: <strong>
                      {Object.values(formData.flavor_stocks || {}).reduce((s, v) => s + (parseInt(v, 10) || 0), 0)}
                    </strong>
                  </p>
                </div>
              )}

              {formData.flavors.length > 0 && (
                <div className="bg-[#fce8e2] border-2 border-[#e3b9b9] rounded-lg p-3 mt-2">
                  <label className="block text-sm font-semibold text-[#5a1f2a] mb-2">
                    🍫 Maksimal Pilihan Rasa per Order
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData({ ...formData, max_flavors_selectable: n })}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                          formData.max_flavors_selectable === n
                            ? 'bg-[#5a1f2a] text-white'
                            : 'bg-white text-[#5a1f2a] border-2 border-[#e3b9b9]'
                        }`}
                      >
                        {n} Rasa
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#722f37] mt-2">
                    Pelanggan bisa pilih maksimal {formData.max_flavors_selectable} rasa per produk
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-2">Varian Ukuran</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                <input
                  type="text"
                  value={sizeNameInput}
                  onChange={(e) => setSizeNameInput(e.target.value)}
                  placeholder="e.g. Small / 16cm"
                  className="flex-1 min-w-[200px] border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
                />
                <input
                  type="number"
                  value={sizePriceInput}
                  onChange={(e) => setSizePriceInput(e.target.value)}
                  placeholder="Selisih harga"
                  className="w-40 border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
                />
                <button onClick={addSize} className="bg-[#5a1f2a] text-white px-4 py-2 rounded-lg font-semibold">
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((s, i) => (
                  <span key={i} className="bg-[#fce8e2] text-[#5a1f2a] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {s.name} {s.price ? `(+Rp ${Number(s.price).toLocaleString('id-ID')})` : ''}
                    <button onClick={() => removeSize(i)} className="font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#5a1f2a] mb-2">
                📸 Foto Produk (Maks. 3 - Shopee Style)
              </label>
              <p className="text-xs text-[#722f37] mb-3">
                Upload sampai 3 foto. Foto pertama akan jadi foto utama yang tampil di card produk.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-bold text-[#5a1f2a] mb-1">⭐ Foto Utama</p>
                  <ImageUpload
                    label=""
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#5a1f2a] mb-1">📷 Foto 2</p>
                  <ImageUpload
                    label=""
                    value={formData.image_url_2}
                    onChange={(url) => setFormData({ ...formData, image_url_2: url })}
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#5a1f2a] mb-1">📷 Foto 3</p>
                  <ImageUpload
                    label=""
                    value={formData.image_url_3}
                    onChange={(url) => setFormData({ ...formData, image_url_3: url })}
                  />
                </div>
              </div>
            </div>
          </div>

          {formMessage && (
            <div className={`p-3 rounded-lg ${
              formMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {formMessage.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Save'}
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

      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-12 text-center">
          <p className="text-4xl mb-2">🥖</p>
          <p className="text-[#722f37]">Belum ada produk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white border-2 border-[#e3b9b9] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        (product.product_type || 'daily') === 'special'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {(product.product_type || 'daily') === 'special' ? '🎂 SPECIAL' : '☀️ DAILY'}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#5a1f2a]">{product.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_active ? '✓' : '✗'}
                  </span>
                </div>

                <div className="space-y-1 mb-4 text-sm text-[#5a1f2a]">
                  <p>
                    <span className="font-semibold">Price:</span>{' '}
                    <span className="font-bold">Rp {Number(product.price).toLocaleString('id-ID')}</span>
                  </p>
                  {(() => {
                    const fs = Array.isArray(product.flavor_stocks) ? product.flavor_stocks : [];
                    if (fs.length > 0) {
                      const total = fs.reduce((s, v) => s + (v.stock || 0), 0);
                      return (
                        <>
                          <p>
                            <span className="font-semibold">Stock total:</span>{' '}
                            <span className={total > 0 ? '' : 'text-red-600 font-bold'}>
                              {total} {total > 0 ? '(per varian)' : '(Habis!)'}
                            </span>
                          </p>
                          <div className="text-xs space-y-0.5 mt-1">
                            {fs.map((v) => (
                              <div key={v.flavor} className="flex justify-between bg-[#fce8e2] rounded px-2 py-0.5">
                                <span>{v.flavor}</span>
                                <span className={v.stock > 0 ? 'font-semibold' : 'text-red-600 font-bold'}>
                                  {v.stock > 0 ? v.stock : 'Habis'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    }
                    return (
                      <p>
                        <span className="font-semibold">Stock:</span>{' '}
                        <span className={product.stock > 0 ? '' : 'text-red-600 font-bold'}>
                          {product.stock} {product.stock > 0 ? '' : '(Habis!)'}
                        </span>
                      </p>
                    );
                  })()}
                  {product.flavors?.length > 0 && !(product.flavor_stocks?.length) && (
                    <p className="text-xs"><span className="font-semibold">Rasa:</span> {product.flavors.join(', ')}</p>
                  )}
                  {product.sizes?.length > 0 && (
                    <p className="text-xs"><span className="font-semibold">Ukuran:</span> {product.sizes.map((s) => s.name).join(', ')}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition-colors text-sm"
                  >
                    Delete
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
