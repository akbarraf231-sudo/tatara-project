'use client';

import { useCart } from '@/lib/cartContext';

export function FloatingCartBadge() {
  const { items, total, openCart } = useCart();
  const itemCount = items.reduce((sum, it) => sum + it.qty, 0);

  if (itemCount === 0) return null;

  return (
    <button
      onClick={openCart}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-[#5a1f2a] hover:bg-[#722f37] text-white rounded-full shadow-2xl px-4 py-2.5 flex items-center gap-2 transition-all hover:scale-105 sm:bottom-8 animate-slide-up"
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      title="Lihat keranjang"
    >
      <div className="relative">
        <span className="text-2xl">🛒</span>
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#5a1f2a] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
          {itemCount}
        </span>
      </div>
      <div className="text-left">
        <p className="text-xs text-[#fce8e2] leading-tight">{itemCount} item dalam keranjang</p>
        <p className="text-sm font-bold leading-tight">Rp {total.toLocaleString('id-ID')}</p>
      </div>
      <span className="text-sm font-bold border-l border-white/30 pl-3">Lihat →</span>
    </button>
  );
}
