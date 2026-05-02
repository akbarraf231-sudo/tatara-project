'use client';

import { useState } from 'react';
import { useModalBackButton } from '@/lib/useModalBackButton';

export function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useModalBackButton(isOpen, onClose);

  if (!isOpen) return null;

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Password salah');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      setPassword('');
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#fce8e2] rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white flex items-center justify-center text-3xl shadow-md">
            🔐
          </div>
          <h2 className="text-2xl font-bold text-[#5a1f2a]">Admin Login</h2>
          <p className="text-sm text-[#722f37] mt-1">Sinar Jaya Bakery</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              disabled={loading}
              autoFocus
              className="w-full border-2 border-[#e3b9b9] rounded-full py-3 px-4 focus:outline-none focus:border-[#c89292] text-[#5a1f2a] placeholder-[#c89292] bg-white"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-2xl text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-[#e3b9b9] hover:bg-[#c89292] hover:text-white text-[#5a1f2a] font-semibold py-3 px-4 rounded-full transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex-1 bg-[#5a1f2a] hover:bg-[#722f37] disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-full transition-colors"
            >
              {loading ? '⏳ Login...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
