'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { ProductDetailModal } from './ProductDetailModal';

export function ProductCard({ product, disabled }) {
  const { addItem } = useCart();
  const [favorite, setFavorite] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const inStock = product.stock > 0 && !disabled;
  const isSpecial = (product.product_type || 'daily') === 'special';
  const productImages = [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean);

  function commitAdd(opts = {}) {
    if (!inStock) return;
    const qtyToAdd = opts.qty || 1;
    for (let i = 0; i < qtyToAdd; i++) {
      addItem(product, {
        flavor: opts.flavor || null,
        size: opts.size?.name || null,
        sizePriceDelta: opts.size?.price || 0,
      });
    }
    setShowDetail(false);
  }

  function openDetail() {
    setShowDetail(true);
  }

  return (
    <>
      <div className="bg-[#e3b9b9] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow relative">
        {isSpecial && (
          <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow">
            🎂 KHUSUS
          </div>
        )}
        <div className="relative bg-[#fce8e2] p-3 sm:p-4 pt-6">
          <button
            onClick={(e) => { e.stopPropagation(); setFavorite(!favorite); }}
            className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
            title="Favorite"
          >
            {favorite ? <span className="text-red-500 text-lg">♥</span> : <span className="text-[#c89292] text-lg">♡</span>}
          </button>

          <button
            onClick={openDetail}
            className="relative w-full h-40 sm:h-48 flex items-center justify-center overflow-hidden cursor-pointer group"
            title="Lihat detail produk"
          >
            {productImages.length > 0 ? (
              <>
                <img src={productImages[activeImg]} alt={product.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform" />
                {productImages.length > 1 && (
                  <>
                    <span
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveImg((p) => (p - 1 + productImages.length) % productImages.length); }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 text-[#5a1f2a] w-7 h-7 rounded-full font-bold shadow flex items-center justify-center"
                    >‹</span>
                    <span
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveImg((p) => (p + 1) % productImages.length); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 text-[#5a1f2a] w-7 h-7 rounded-full font-bold shadow flex items-center justify-center"
                    >›</span>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {productImages.map((_, i) => (
                        <span key={i} className={`h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute top-2 right-12 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  👁️ Lihat detail
                </div>
              </>
            ) : (
              <div className="text-6xl sm:text-7xl">{isSpecial ? '🎂' : '🍰'}</div>
            )}
          </button>
        </div>

        <div className="bg-[#c89292] p-3 sm:p-4 text-white">
          <button onClick={openDetail} className="w-full text-left">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base sm:text-lg truncate flex-1 hover:underline">{product.name}</h3>
            </div>
            {product.description && (
              <p className="text-xs text-[#fce8e2] mb-2 line-clamp-2">{product.description}</p>
            )}
          </button>
          <div className="flex items-center justify-between gap-2">
            <p className="text-base sm:text-lg font-bold">Rp {Number(product.price).toLocaleString('id-ID')}</p>
            <p className="text-[10px] sm:text-xs text-[#fce8e2]">{inStock ? `Stok: ${product.stock}` : 'Habis'}</p>
          </div>
        </div>
      </div>

      {showDetail && (
        <ProductDetailModal
          product={product}
          disabled={disabled}
          onClose={() => setShowDetail(false)}
          onAddToCart={(opts) => commitAdd(opts)}
        />
      )}
    </>
  );
}
