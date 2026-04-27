'use client';

import { useState, useEffect } from 'react';

export function AdminOnboarding() {
  const [tips, setTips] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tips');
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  async function fetchOnboardingData() {
    try {
      const token = localStorage.getItem('adminToken');
      const [tipsRes, checklistRes] = await Promise.all([
        fetch('/api/admin/onboarding/tips', {
          headers: { 'x-admin-token': token },
        }),
        fetch('/api/admin/onboarding/checklist', {
          headers: { 'x-admin-token': token },
        }),
      ]);

      if (!tipsRes.ok || !checklistRes.ok) {
        throw new Error('Failed to fetch onboarding data');
      }

      const tipsData = await tipsRes.json();
      const checklistData = await checklistRes.json();

      if (tipsData.success) setTips(tipsData.data || []);
      if (checklistData.success) setChecklist(checklistData.data || []);

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleChecklistItem(checklistId, completed) {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/onboarding/checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          checklistId,
          completed: !completed,
        }),
      });

      if (!res.ok) throw new Error('Failed to update checklist');

      setChecklist((prev) =>
        prev.map((item) =>
          item.id === checklistId ? { ...item, completed: !item.completed } : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="text-[#5a1f2a]">Loading onboarding...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>;

  const completedCount = checklist.filter((item) => item.completed).length;
  const completionPercentage = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const currentTip = tips[tipIndex] || null;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'getting-started': return '👋';
      case 'inventory':       return '📦';
      case 'sales':           return '💰';
      case 'customers':       return '👥';
      case 'best-practices':  return '⭐';
      case 'setup':           return '⚙️';
      case 'first-product':   return '🎂';
      case 'first-order':     return '🛒';
      default:                return '📚';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'getting-started': return 'Memulai';
      case 'inventory':       return 'Stok & Bahan';
      case 'sales':           return 'Penjualan';
      case 'customers':       return 'Pelanggan';
      case 'best-practices':  return 'Tips Terbaik';
      case 'setup':           return 'Setup Awal';
      case 'first-product':   return 'Produk Pertama';
      case 'first-order':     return 'Order Pertama';
      default:                return 'Panduan';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'getting-started': return { border: 'bg-blue-50 border-blue-400',    icon: 'bg-blue-100',    badge: 'bg-blue-200 text-blue-800' };
      case 'inventory':       return { border: 'bg-orange-50 border-orange-400', icon: 'bg-orange-100',  badge: 'bg-orange-200 text-orange-800' };
      case 'sales':           return { border: 'bg-green-50 border-green-400',   icon: 'bg-green-100',   badge: 'bg-green-200 text-green-800' };
      case 'customers':       return { border: 'bg-purple-50 border-purple-400', icon: 'bg-purple-100',  badge: 'bg-purple-200 text-purple-800' };
      case 'best-practices':  return { border: 'bg-yellow-50 border-yellow-400', icon: 'bg-yellow-100',  badge: 'bg-yellow-200 text-yellow-800' };
      default:                return { border: 'bg-pink-50 border-pink-400',     icon: 'bg-pink-100',    badge: 'bg-pink-200 text-pink-800' };
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5a1f2a]">🎓 Owner Onboarding</h2>

      {/* Progress Bar */}
      <div className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-[#5a1f2a]">Setup Progress</p>
          <p className="text-lg font-bold text-[#5a1f2a]">{completionPercentage}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#5a1f2a] to-[#722f37] h-3 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-[#722f37] mt-2">
          {completedCount} dari {checklist.length} tasks selesai
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-[#e3b9b9]">
        <button
          onClick={() => setActiveTab('tips')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-4 ${
            activeTab === 'tips'
              ? 'border-[#5a1f2a] text-[#5a1f2a]'
              : 'border-transparent text-[#722f37] hover:text-[#5a1f2a]'
          }`}
        >
          💡 Tips & Panduan
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-4 ${
            activeTab === 'checklist'
              ? 'border-[#5a1f2a] text-[#5a1f2a]'
              : 'border-transparent text-[#722f37] hover:text-[#5a1f2a]'
          }`}
        >
          ✅ Checklist
        </button>
      </div>

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <div>
          {currentTip ? (
            <div>
              <div className={`rounded-2xl p-5 shadow-md border-l-8 ${getCategoryColor(currentTip.category).border}`}>
                <div className="flex items-start gap-4">
                  <div className={`text-4xl p-3 rounded-2xl flex-shrink-0 ${getCategoryColor(currentTip.category).icon}`}>
                    {currentTip.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(currentTip.category).badge}`}>
                        {getCategoryIcon(currentTip.category)} {getCategoryLabel(currentTip.category)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{currentTip.title}</h3>
                    <p className="text-base font-semibold text-gray-800 leading-relaxed">{currentTip.description}</p>
                    {currentTip.video_url && (
                      <a
                        href={currentTip.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 bg-[#5a1f2a] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#722f37] transition-all"
                      >
                        📹 Tonton Video
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {tips.length > 1 && (
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => setTipIndex((prev) => (prev - 1 + tips.length) % tips.length)}
                    className="bg-[#fce8e2] hover:bg-[#e3b9b9] text-[#5a1f2a] px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  >
                    ← Sebelumnya
                  </button>
                  <span className="text-sm text-[#722f37] font-semibold">
                    Tip {tipIndex + 1} dari {tips.length}
                  </span>
                  <button
                    onClick={() => setTipIndex((prev) => (prev + 1) % tips.length)}
                    className="bg-[#fce8e2] hover:bg-[#e3b9b9] text-[#5a1f2a] px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  >
                    Berikutnya →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-[#722f37]">Tidak ada tips tersedia</div>
          )}
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          {checklist.length === 0 ? (
            <p className="text-[#722f37]">Tidak ada checklist</p>
          ) : (
            Object.entries(
              checklist.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <div key={category} className="bg-white border-2 border-[#e3b9b9] rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-bold text-[#5a1f2a] mb-4">
                  {getCategoryIcon(category)} {category.replace('-', ' ').toUpperCase()}
                </h3>
                <div className="space-y-3">
                  {items
                    .sort((a, b) => b.priority - a.priority)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                          item.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200 hover:border-[#e3b9b9]'
                        }`}
                      >
                        <button
                          onClick={() => toggleChecklistItem(item.id, item.completed)}
                          className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 transition-all ${
                            item.completed ? 'bg-green-500' : 'bg-gray-300 hover:bg-[#5a1f2a]'
                          }`}
                        >
                          {item.completed ? '✓' : ''}
                        </button>
                        <div className="flex-1">
                          <p className={`font-semibold ${item.completed ? 'text-green-700 line-through' : 'text-[#5a1f2a]'}`}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-sm text-[#722f37] mt-1">{item.description}</p>
                          )}
                          {item.video_url && (
                            <a
                              href={item.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                            >
                              📹 Tutorial Video
                            </a>
                          )}
                        </div>
                        {item.completed && (
                          <div className="text-2xl flex-shrink-0">✅</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
