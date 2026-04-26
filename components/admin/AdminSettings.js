'use client';

import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    location_link: '',
    qris_image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings({
        whatsapp_number: data.data?.whatsapp_number || '',
        location_link: data.data?.location_link || '',
        qris_image_url: data.data?.qris_image_url || '',
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
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setMessage({ type: 'success', text: 'Settings berhasil disimpan!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-[#5a1f2a]">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5a1f2a]">⚙️ Settings</h2>

      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 space-y-6 max-w-2xl shadow-md">
        {/* WhatsApp Number */}
        <div>
          <label htmlFor="wa-number" className="block text-sm font-bold text-[#5a1f2a] mb-2">
            📱 WhatsApp Number
          </label>
          <input
            id="wa-number"
            type="text"
            placeholder="+6281234567890"
            value={settings.whatsapp_number}
            onChange={(e) =>
              setSettings({ ...settings, whatsapp_number: e.target.value })
            }
            className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
          />
          <p className="text-xs text-[#722f37] mt-1">
            Pakai kode negara (e.g. +62 untuk Indonesia)
          </p>
        </div>

        {/* Location Link */}
        <div>
          <label htmlFor="location" className="block text-sm font-bold text-[#5a1f2a] mb-2">
            📍 Location Link (Google Maps)
          </label>
          <input
            id="location"
            type="text"
            placeholder="https://maps.app.goo.gl/..."
            value={settings.location_link}
            onChange={(e) =>
              setSettings({ ...settings, location_link: e.target.value })
            }
            className="w-full border-2 border-[#e3b9b9] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5a1f2a] text-[#5a1f2a]"
          />
          <p className="text-xs text-[#722f37] mt-1">
            Paste link Google Maps lokasi toko
          </p>
        </div>

        {/* QRIS Image */}
        <div>
          <ImageUpload
            label="💳 QRIS Image"
            value={settings.qris_image_url}
            onChange={(url) => setSettings({ ...settings, qris_image_url: url })}
          />
          <p className="text-xs text-[#722f37] mt-1">
            Drag & drop QRIS code, atau klik untuk pilih file
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Settings'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm text-blue-900 max-w-2xl">
        <p className="font-bold mb-2">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Google Maps Link:</strong> Buka Google Maps → cari toko → Share → Copy link</li>
          <li><strong>QRIS:</strong> Drag & drop file QRIS, atau screenshot QRIS lalu paste (Ctrl+V) di kotak upload</li>
        </ul>
      </div>
    </div>
  );
}
