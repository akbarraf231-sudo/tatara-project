'use client';

import { useState, useEffect } from 'react';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shown = sessionStorage.getItem('splash_shown');
    if (shown) {
      setVisible(false);
      return;
    }

    try {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((d) => {
          if (d?.data?.site_logo_url) {
            setLogoUrl(d.data.site_logo_url);
          }
        })
        .catch(() => {});
    } catch (_) {
      // Silently fail, use emoji default
    }

    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('splash_shown', '1');
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-[#fce8e2] via-[#e3b9b9] to-[#c89292] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center animate-pulse">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white shadow-2xl mx-auto mb-6 flex items-center justify-center text-7xl sm:text-8xl border-4 border-white overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Sinar Jaya Bakery" className="w-full h-full object-cover" />
          ) : (
            <span>🍰</span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#5a1f2a] mb-1 tracking-wide">
          Sinar Jaya
        </h1>
        <p className="text-sm sm:text-base text-[#722f37] tracking-[0.3em] font-semibold">
          BAKERY
        </p>
        <p className="text-xs text-[#722f37] mt-3 italic">— Est. 2016 —</p>
        <div className="mt-8 flex justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#5a1f2a] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#5a1f2a] animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#5a1f2a] animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
