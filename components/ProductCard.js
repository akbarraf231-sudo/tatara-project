'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/lib/cartContext';

function VariantModal({ product, flavors, sizes, onClose, onConfirm }) {
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!mounted) return null;

  function handleConfirm() {
    if (flavors.length > 0 && !selectedFlavor) {
      alert('Pilih varian rasa dulu');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      alert('Pilih ukuran dulu');
      return;
    }
    onConfirm({ flavor: selectedFlavor, size: selectedSize });
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full sm:max-w-sm text-[#5a1f2a] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg sm:text-xl flex-1 truncate">{product.name}</h3>
          <button onClick={onClose} className="text-2xl text-[#722f37] ml-2 leading-none">×</button>
        </div>

        {flavors.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-2 text-sm">Pilih Rasa:</p>
            <div className="flex flex-wrap gap-2">
              {flavors.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFlavor(selectedFlavor === f ? '' : f)}
                  className={`px-3 py-2 rounded-full text-sm border-2 transition-colors ${
                    selectedFlavor === f
                      ? 'bg-[#5a1f2a] text-white border-[#5a1f2a]'
                      : 'bg-white text-[#5a1f2a] border-[#e3b9b9]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-2 text-sm">Pilih Ukuran:</p>
            <div className="flex flex-col gap-2">
              {sizes.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-3 rounded-lg text-sm border-2 flex justify-between transition-colors ${
                    selectedSize?.name === s.name
                      ? 'bg-[#5a1f2a] text-white border-[#5a1f2a]'
                      : 'bg-white text-[#5a1f2a] border-[#e3b9b9]'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="font-semibold">
                    Rp {(Number(product.price) + Number(s.price || 0)).toLocaleString('id-ID')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 sticky bottom-0 bg-white pt-3 -mx-5 sm:-mx-6 px-5 sm:px-6">
          <button onClick={onClose} className="flex-1 bg-[#fce8e2] text-[#5a1f2a] py-3 rounded-full font-semibold text-sm">
            Batal
          </button>
          <button onClick={handleConfirm} className="flex-1 bg-[#5a1f2a] text-white py-3 rounded-full font-semibold text-sm">
            + Add to Cart
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const inStock = product.stock > 0;
  const isSpecial = (product.product_type || 'daily') === 'special';
  const flavors = Array.isArray(product.flavors) ? product.flavors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const hasVariants = flavors.length > 0 || sizes.length > 0;

  function commitAdd(opts = {}) {
    if (!inStock) return;
    addItem(product, {
      flavor: opts.flavor || null,
      size: opts.size?.name || null,
      sizePriceDelta: opts.size?.price || 0,
    });
    setAdded(true);
    setShowOptions(false);
    setTimeout(() => setAdded(false), 1200);
  }

  function handleClick() {
    if (!inStock) return;
    if (hasVariants) {
      setShowOptions(true);
    } else {
      commitAdd();
    }
  }

  return (
    <>
      <div className="bg-[#e3b9b9] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow relative">
        {isSpecial && (
          <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow">
            🎂 SPECIAL
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

          <div className="w-full h-40 sm:h-48 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="text-6xl sm:text-7xl">{isSpecial ? '🎂' : '🍰'}</div>
            )}
          </div>
        </div>

        <div className="bg-[#c89292] p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base sm:text-lg truncate flex-1">{product.name}</h3>
          </div>
          {product.description && (
            <p className="text-xs text-[#fce8e2] mb-2 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-base sm:text-lg font-bold">Rp {Number(product.price).toLocaleString('id-ID')}</p>
            <p className="text-[10px] sm:text-xs text-[#fce8e2]">{inStock ? `Stok: ${product.stock}` : 'Habis'}</p>
          </div>
          <button
            onClick={handleClick}
            disabled={!inStock}
            className={`w-full py-2 px-4 rounded-full font-semibold transition-all text-sm ${
              !inStock ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : added ? 'bg-green-500 text-white'
                : 'bg-[#5a1f2a] hover:bg-[#722f37] text-white'
            }`}
          >
            {!inStock ? 'Habis' : added ? '✓ Added!' : hasVariants ? '+ Pilih Varian' : '+ Add to Cart'}
          </button>
        </div>
      </div>

      {showOptions && (
        <VariantModal
          product={product}
          flavors={flavors}
          sizes={sizes}
          onClose={() => setShowOptions(false)}
          onConfirm={(opts) => commitAdd(opts)}
        />
      )}
    </>
  );
}
