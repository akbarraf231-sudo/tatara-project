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
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
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
            label="💳 QRIS Image"
            value={settings.qris_image_url}
            onChange={(url) => setSettings({ ...settings, qris_image_url: url })}
          />
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
    </div>
  );
}
