'use client';

import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    location_link: '',
    qris_image_url: '',
    cs_whatsapp_number: '',
    special_lead_time_days: 3,
    site_logo_url: '',
    store_status: 'open',
    closed_message: 'Toko sedang tutup. Terima kasih!',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings({
        whatsapp_number: data.data?.whatsapp_number || '',
        location_link: data.data?.location_link || '',
        qris_image_url: data.data?.qris_image_url || '',
        cs_whatsapp_number: data.data?.cs_whatsapp_number || '',
        special_lead_time_days: data.data?.special_lead_time_days ?? 3,
        site_logo_url: data.data?.site_logo_url || '',
        store_status: data.data?.store_status || 'open',
        closed_message: data.data?.closed_message || 'Toko sedang tutup. Terima kasih!',
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function autoSaveStoreStatus(newStatus) {
    setSettings((prev) => ({ ...prev, store_status: newStatus }));
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ ...settings, store_status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setMessage({ type: 'success', text: newStatus === 'open' ? '🟢 Toko buka' : '🔴 Toko tutup' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      setMessage({ type: 'success', text: 'Settings berhasil disimpan!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function exportOrders() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/orders?limit=10000', {
        headers: { 'x-admin-token': token },
      });
      const data = await res.json();
      const orders = data.data || [];

      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('LAPORAN ORDERS', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 105, 28, { align: 'center' });
      doc.text(`Total Orders: ${orders.length}`, 105, 34, { align: 'center' });

      autoTable(doc, {
        startY: 42,
        head: [['Tanggal', 'Customer', 'No HP', 'Total', 'Status', 'Tipe']],
        body: orders.map(o => [
          new Date(o.created_at).toLocaleDateString('id-ID'),
          o.customer_name,
          o.customer_phone || '-',
          `Rp ${Number(o.total).toLocaleString('id-ID')}`,
          o.status,
          o.order_type,
        ]),
        headStyles: { fillColor: [90, 31, 42], textColor: 255, fontStyle: 'bold' },
        theme: 'striped',
        styles: { fontSize: 8 },
      });

      doc.save(`orders-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal export orders: ' + err.message });
    }
  }

  async function exportProducts() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/products', {
        headers: { 'x-admin-token': token },
      });
      const data = await res.json();
      const products = data.data || [];

      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('LAPORAN PRODUCTS', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 105, 28, { align: 'center' });
      doc.text(`Total Products: ${products.length}`, 105, 34, { align: 'center' });

      autoTable(doc, {
        startY: 42,
        head: [['Nama Produk', 'Harga', 'Stok', 'Tipe', 'Status']],
        body: products.map(p => [
          p.name,
          `Rp ${Number(p.price).toLocaleString('id-ID')}`,
          p.stock.toString(),
          p.product_type || 'daily',
          p.is_active ? 'Aktif' : 'Tidak Aktif',
        ]),
        headStyles: { fillColor: [90, 31, 42], textColor: 255, fontStyle: 'bold' },
        theme: 'striped',
        styles: { fontSize: 9 },
      });

      doc.save(`products-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal export products: ' + err.message });
    }
  }

  if (loading) return <div className="text-[#5a1f2a]">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5a1f2a]">⚙️ Settings</h2>

      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 space-y-6 max-w-2xl shadow-md">
        <div>
          <label className="block text-sm font-bold text-[#5a1f2a] mb-2">📱 WhatsApp Order (untuk terima order)</label>
          <input
            type="text"
            placeholder="+6281234567890"
            value={settings.whatsapp_number}
            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
            className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
          <p className="text-xs text-[#722f37] mt-1">Nomor admin yang menerima pesanan</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#5a1f2a] mb-2">💬 WhatsApp CS / Customer Service</label>
          <input
            type="text"
            placeholder="+6281234567890"
            value={settings.cs_whatsapp_number}
            onChange={(e) => setSettings({ ...settings, cs_whatsapp_number: e.target.value })}
            className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
          <p className="text-xs text-[#722f37] mt-1">Nomor untuk floating WA button (kosongkan = pakai nomor order)</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#5a1f2a] mb-2">🎂 Special Order Lead Time (hari)</label>
          <input
            type="number"
            min="1"
            value={settings.special_lead_time_days}
            onChange={(e) => setSettings({ ...settings, special_lead_time_days: parseInt(e.target.value) || 1 })}
            className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
          <p className="text-xs text-[#722f37] mt-1">
            Pelanggan harus pesan H-{settings.special_lead_time_days} sebelum tanggal pickup untuk Special Order
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#5a1f2a] mb-2">📍 Location Link (Google Maps)</label>
          <input
            type="text"
            placeholder="https://maps.app.goo.gl/..."
            value={settings.location_link}
            onChange={(e) => setSettings({ ...settings, location_link: e.target.value })}
            className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a]"
          />
        </div>

        <div>
          <ImageUpload
            label="🖼️ Logo Toko (Navbar)"
            value={settings.site_logo_url}
            onChange={(url) => setSettings({ ...settings, site_logo_url: url })}
          />
          <p className="text-xs text-[#722f37] mt-1">Logo bulat di navbar. Kosongkan untuk pakai emoji default 🍰</p>
        </div>

        <div>
          <ImageUpload
            label="💳 QRIS Image"
            value={settings.qris_image_url}
            onChange={(url) => setSettings({ ...settings, qris_image_url: url })}
          />
        </div>

        <div className="border-t-2 border-[#e3b9b9] pt-6">
          <label className="block text-sm font-bold text-[#5a1f2a] mb-4">🔴 Status Toko</label>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => autoSaveStoreStatus('open')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                settings.store_status === 'open'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🟢 Buka
            </button>
            <button
              onClick={() => autoSaveStoreStatus('closed')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                settings.store_status === 'closed'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔴 Tutup
            </button>
          </div>
          {settings.store_status === 'closed' && (
            <div>
              <label className="block text-xs font-bold text-[#5a1f2a] mb-2">Pesan saat toko tutup:</label>
              <textarea
                value={settings.closed_message}
                onChange={(e) => setSettings({ ...settings, closed_message: e.target.value })}
                className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 text-[#5a1f2a] text-sm"
                rows="2"
                placeholder="Toko sedang tutup..."
              />
            </div>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Settings'}
        </button>
      </div>

      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 max-w-2xl shadow-md">
        <h3 className="text-lg font-bold text-[#5a1f2a] mb-4">📊 Export Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportOrders}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            📋 Export Orders
          </button>
          <button
            onClick={exportProducts}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            🍰 Export Products
          </button>
        </div>
        <p className="text-xs text-[#722f37] mt-3">Data akan di-download sebagai file PDF</p>
      </div>
    </div>
  );
}
