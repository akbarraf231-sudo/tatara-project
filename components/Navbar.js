'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { AdminLoginModal } from './AdminLoginModal';

export function Navbar({ initialLogoUrl = '' }) {
  const router = useRouter();
  const { items, openCart } = useCart();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);

    const fetchLogo = () => {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((d) => setLogoUrl(d.data?.site_logo_url || ''))
        .catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLogo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminModalOpen(false);
    // Defer navigation so useModalBackButton cleanup (history.back) finishes first.
    // Without this, the cleanup pops the entry router.push just added → user lands back on /.
    setTimeout(() => router.push('/admin'), 0);
  };

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }

  // Hidden admin trigger: 3 quick clicks on the logo
  function handleLogoClick() {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);

    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0;
      if (isAdmin) {
        router.push('/admin');
      } else {
        setIsAdminModalOpen(true);
      }
      return;
    }

    logoClickTimer.current = setTimeout(() => {
      if (logoClickCount.current < 3) {
        logoClickCount.current = 0;
        scrollTo('home');
      }
    }, 600);
  }

  return (
    <>
      <nav className="bg-[#fce8e2] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <button onClick={handleLogoClick} className="flex items-center gap-2 group" aria-label="Home">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-md flex items-center justify-center text-xl sm:text-2xl border-2 border-[#e3b9b9] group-hover:scale-105 transition-transform overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Sinar Jaya Bakery" className="w-full h-full object-cover" />
              ) : (
                '🍰'
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-base font-bold text-[#5a1f2a] leading-tight">Sinar Jaya</p>
              <p className="text-xs text-[#722f37] tracking-widest">BAKERY</p>
            </div>
          </button>

          <div className="hidden md:flex gap-6 lg:gap-8 text-[#5a1f2a] font-medium">
            <button onClick={() => scrollTo('home')} className="hover:text-[#c89292] transition-colors">Beranda</button>
            <button onClick={() => scrollTo('daily')} className="hover:text-[#c89292] transition-colors">Harian</button>
            <button onClick={() => scrollTo('special')} className="hover:text-[#c89292] transition-colors">Khusus</button>
            <button onClick={() => openCart()} className="hover:text-[#c89292] transition-colors">Pesan</button>
            <button onClick={() => scrollTo('about')} className="hover:text-[#c89292] transition-colors">Tentang</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-[#c89292] transition-colors">Hubungi</button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => openCart()}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#e3b9b9] transition-colors flex items-center justify-center shadow-sm relative"
              title="Cart"
              aria-label="Cart"
            >
              <svg className="w-5 h-5 text-[#5a1f2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#5a1f2a] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-white hover:bg-[#e3b9b9] flex items-center justify-center shadow-sm"
              aria-label="Menu"
            >
              <svg className="w-5 h-5 text-[#5a1f2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-[#e3b9b9] bg-[#fce8e2]">
            <div className="flex flex-col py-2">
              <button onClick={() => scrollTo('home')} className="text-left px-6 py-3 text-[#5a1f2a] font-medium hover:bg-[#e3b9b9]/40">🏠 Beranda</button>
              <button onClick={() => scrollTo('daily')} className="text-left px-6 py-3 text-[#5a1f2a] font-medium hover:bg-[#e3b9b9]/40">☀️ Harian</button>
              <button onClick={() => scrollTo('special')} className="text-left px-6 py-3 text-[#5a1f2a] font-medium hover:bg-[#e3b9b9]/40">🎂 Khusus</button>
              <button onClick={() => openCart()} className="text-left px-6 py-3 text-[#5a1f2a] font-medium hover:bg-[#e3b9b9]/40">🛒 Pesan</button>
              <button onClick={() => scrollTo('about')} className="text-left px-6 py-3 text-[#5a1f2a] font-medium hover:bg-[#e3b9b9]/40">ℹ️ Tentang</button>
              <button onClick={() => scrollTo('contact')} className="text-left px-6 py-3 text-[#5a1f2a] font-medium hover:bg-[#e3b9b9]/40">📍 Hubungi</button>
            </div>
          </div>
        )}
      </nav>

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </>
  );
}
