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
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminModalOpen(false);
  };

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <nav className="bg-white border-b-4 border-[#6b4423] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl">🥐</div>
            <h1 className="text-2xl font-bold text-[#6b4423]">BAKERY</h1>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex gap-6 text-[#6b4423] font-semibold">
            <a href="#home" className="hover:text-[#c8794a] transition-colors">HOME</a>
            <a href="#menu" className="hover:text-[#c8794a] transition-colors">MENU</a>
            <a href="#about" className="hover:text-[#c8794a] transition-colors">ABOUT</a>
            <a href="#contact" className="hover:text-[#c8794a] transition-colors">CONTACT</a>
          </div>

          {/* Right Side - Icons & Buttons */}
          <div className="flex items-center gap-4">
            {isAdmin && (
              <div className="text-sm text-[#6b4423] hidden md:flex items-center gap-2">
                <span className="font-semibold">Admin</span>
                <button
                  onClick={handleAdminLogout}
                  className="text-xs bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Settings Icon */}
            <button
              onClick={() => {
                if (isAdmin) {
                  window.location.href = '/admin';
                } else {
                  setIsAdminModalOpen(true);
                }
              }}
              className="p-2 hover:bg-[#f5ebe0] rounded-lg transition-colors"
              title="Admin"
            >
              <svg
                className="w-6 h-6 text-[#6b4423]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => {
                const cartElement = document.querySelector('[data-cart-toggle]');
                if (cartElement) {
                  cartElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="p-2 hover:bg-[#f5ebe0] rounded-lg transition-colors relative"
              title="Cart"
            >
              <svg
                className="w-6 h-6 text-[#6b4423]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c8794a] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
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
