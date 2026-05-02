'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/lib/cartContext';
import { Cart } from './Cart';

export function CartDrawer({ disabled }) {
  const { isOpen, closeCart } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeCart();
    }
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={closeCart}
    >
      <div
        className="bg-[#fce8e2] w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-drawer-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#5a1f2a] text-white px-5 py-4 flex items-center justify-between z-10 rounded-t-3xl">
          <h2 className="text-xl font-bold">🛒 Keranjang Belanja</h2>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-2xl leading-none"
            title="Tutup"
          >
            ×
          </button>
        </div>
        <div className="p-3 sm:p-5">
          <Cart disabled={disabled} onPaymentSuccess={closeCart} />
        </div>
      </div>
    </div>,
    document.body
  );
}
