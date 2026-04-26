'use client';

import { useState, useRef, useEffect } from 'react';

export function ImageUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  async function uploadFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File maksimal 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload gagal');
      }

      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) uploadFile(file);
        e.preventDefault();
        return;
      }
    }
  }

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-[#5a1f2a] mb-2">
          {label}
        </label>
      )}

      <div
        ref={dropRef}
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all focus:outline-none ${
          dragActive
            ? 'border-[#5a1f2a] bg-[#fce8e2]'
            : 'border-[#e3b9b9] hover:border-[#5a1f2a] hover:bg-[#fce8e2]'
        }`}
      >
        {value ? (
          <div className="space-y-2">
            <img
              src={value}
              alt="Preview"
              className="max-h-48 mx-auto rounded shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p className="text-xs text-[#722f37]">
              Klik untuk ganti, drag image baru, atau paste (Ctrl+V)
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-xs text-red-600 hover:text-red-800 font-semibold"
            >
              ✕ Hapus gambar
            </button>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <p className="text-4xl">📷</p>
            <p className="text-[#5a1f2a] font-semibold">
              {uploading ? 'Mengupload...' : 'Klik untuk pilih file'}
            </p>
            {!uploading && (
              <>
                <p className="text-sm text-[#722f37]">Atau drag & drop di sini</p>
                <p className="text-xs text-[#722f37]">
                  Atau klik kotak ini lalu paste (Ctrl+V)
                </p>
                <p className="text-xs text-[#722f37]">Max 5MB · JPG/PNG/WebP/GIF</p>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadFile(e.target.files?.[0])}
          disabled={uploading}
        />
      </div>

      {uploading && (
        <p className="text-sm text-[#5a1f2a] mt-2 flex items-center gap-1">
          <span className="animate-spin">⏳</span> Uploading...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-2">⚠️ {error}</p>
      )}
    </div>
  );
}
