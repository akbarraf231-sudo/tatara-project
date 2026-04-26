'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cartContext';
import { AdminLoginModal } from './AdminLoginModal';

export function Navbar() {
  const { items } = useCart();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    window.location.href = '/';
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminModalOpen(false);
    window.location.href = '/admin';
  };

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <nav className="bg-[#fce8e2] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-2xl border-2 border-[#e3b9b9] group-hover:scale-105 transition-transform">
              🍰
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-bold text-[#5a1f2a] leading-tight">Sinar Jaya</p>
              <p className="text-xs text-[#722f37] tracking-widest">BAKERY</p>
            </div>
          </button>

          <div className="hidden md:flex gap-8 text-[#5a1f2a] font-medium">
            <button onClick={() => scrollTo('home')} className="hover:text-[#c89292] hover:underline underline-offset-4 transition-colors">Home</button>
            <button onClick={() => scrollTo('daily')} className="hover:text-[#c89292] hover:underline underline-offset-4 transition-colors">Daily</button>
            <button onClick={() => scrollTo('special')} className="hover:text-[#c89292] hover:underline underline-offset-4 transition-colors">Special</button>
            <button onClick={() => scrollTo('cart')} className="hover:text-[#c89292] hover:underline underline-offset-4 transition-colors">Order</button>
            <button onClick={() => scrollTo('about')} className="hover:text-[#c89292] hover:underline underline-offset-4 transition-colors">About</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-[#c89292] hover:underline underline-offset-4 transition-colors">Contact</button>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={handleAdminLogout}
                className="hidden md:block text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-full font-semibold"
              >
                Logout
              </button>
            )}

            <button
              onClick={() => {
                if (isAdmin) window.location.href = '/admin';
                else setIsAdminModalOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#e3b9b9] transition-colors flex items-center justify-center shadow-sm"
              title="Admin"
            >
              <svg className="w-5 h-5 text-[#5a1f2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            <button
              onClick={() => scrollTo('cart')}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#e3b9b9] transition-colors flex items-center justify-center shadow-sm relative"
              title="Cart"
            >
              <svg className="w-5 h-5 text-[#5a1f2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#5a1f2a] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </>
  );
}
