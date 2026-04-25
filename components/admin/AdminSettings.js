'use client';

import { useState, useEffect } from 'react';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    location_link: '',
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
      setSettings(data.data || {});
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

      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-amber-700">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-900">Settings</h2>

      <div className="bg-white border-2 border-amber-200 rounded-lg p-6 space-y-6 max-w-2xl">
        {/* WhatsApp Number */}
        <div>
          <label htmlFor="wa-number" className="block text-sm font-semibold text-amber-900 mb-2">
            WhatsApp Number
          </label>
          <input
            id="wa-number"
            type="text"
            placeholder="+62 812 3456 7890"
            value={settings.whatsapp_number}
            onChange={(e) =>
              setSettings({ ...settings, whatsapp_number: e.target.value })
            }
            className="w-full border-2 border-amber-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <p className="text-xs text-amber-700 mt-1">
            Include country code (e.g., +62 for Indonesia)
          </p>
        </div>

        {/* Location Link */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-amber-900 mb-2">
            Location Link (Google Maps)
          </label>
          <input
            id="location"
            type="text"
            placeholder="https://maps.google.com/..."
            value={settings.location_link}
            onChange={(e) =>
              setSettings({ ...settings, location_link: e.target.value })
            }
            className="w-full border-2 border-amber-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <p className="text-xs text-amber-700 mt-1">
            Paste your Google Maps link here
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
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-2">📝 How to get Google Maps link:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open Google Maps</li>
          <li>Find your location</li>
          <li>Click "Share" button</li>
          <li>Copy the link</li>
          <li>Paste it here</li>
        </ol>
      </div>
    </div>
  );
}
