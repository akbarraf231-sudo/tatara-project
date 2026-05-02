'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/lib/cartContext';
import { ProductDetailModal } from './ProductDetailModal';

function VariantModal({ product, flavors, sizes, maxFlavors, onClose, onConfirm, disabled }) {
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [mounted, setMounted] = useState(false);

  const productImages = [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean);
  const isSpecial = (product.product_type || 'daily') === 'special';
  const inStock = product.stock > 0 && !disabled;

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!mounted) return null;

  function toggleFlavor(f) {
    setSelectedFlavors((prev) => {
      if (prev.includes(f)) return prev.filter((x) => x !== f);
      if (prev.length >= maxFlavors) {
        if (maxFlavors === 1) return [f];
        return prev;
      }
      return [...prev, f];
    });
  }

  function handleConfirm() {
    if (flavors.length > 0 && selectedFlavors.length === 0) {
      alert('Pilih varian rasa dulu');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      alert('Pilih ukuran dulu');
      return;
    }
    onConfirm({ flavor: selectedFlavors.join(', '), size: selectedSize });
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 flex items-center justify-between border-b border-[#fce8e2]">
          <h2 className="font-bold text-[#5a1f2a] flex-1 truncate pr-2">{product.name}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#fce8e2] hover:bg-[#e3b9b9] flex items-center justify-center text-2xl leading-none text-[#5a1f2a]"
          >
            ×
          </button>
        </div>

        {/* Image Carousel */}
        <div className="relative bg-[#fce8e2] p-4">
          {isSpecial && (
            <div className="absolute top-6 left-6 z-10 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              🎂 KHUSUS
            </div>
          )}
          <div className="relative w-full aspect-square max-h-72 flex items-center justify-center overflow-hidden rounded-2xl">
            {productImages.length > 0 ? (
              <>
                <img src={productImages[activeImg]} alt={product.name} className="w-full h-full object-cover" />
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((p) => (p - 1 + productImages.length) % productImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#5a1f2a] w-9 h-9 rounded-full font-bold shadow-lg text-xl"
                    >‹</button>
                    <button
                      onClick={() => setActiveImg((p) => (p + 1) % productImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#5a1f2a] w-9 h-9 rounded-full font-bold shadow-lg text-xl"
                    >›</button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {productImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`h-2 rounded-full transition-all ${i === activeImg ? 'bg-white w-6' : 'bg-white/60 w-2'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-7xl">{isSpecial ? '🎂' : '🍰'}</div>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeImg ? 'border-[#5a1f2a] scale-105' : 'border-[#e3b9b9] opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 py-3 flex-1">
          <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-[#fce8e2]">
            <p className="text-2xl font-bold text-[#5a1f2a]">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </p>
            <p className={`text-xs font-semibold px-3 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {inStock ? `Stok: ${product.stock}` : 'Habis'}
            </p>
          </div>

          {product.description && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-[#722f37] uppercase mb-1.5">📝 Deskripsi</h4>
              <p className="text-sm text-[#5a1f2a] leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Flavor Selection */}
          {flavors.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-[#722f37] uppercase">🍫 Pilih Rasa</h4>
                <span className="text-xs bg-[#fce8e2] text-[#5a1f2a] px-2 py-0.5 rounded-full font-bold">
                  {selectedFlavors.length} / {maxFlavors}
                </span>
              </div>
              <p className="text-xs text-[#722f37] mb-2">
                {maxFlavors > 1 ? `Pilih maksimal ${maxFlavors} rasa` : 'Pilih 1 rasa'}
              </p>
              <div className="flex flex-wrap gap-2">
                {flavors.map((f) => {
                  const isSelected = selectedFlavors.includes(f);
                  const isDisabled = !isSelected && selectedFlavors.length >= maxFlavors && maxFlavors > 1;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFlavor(f)}
                      disabled={isDisabled}
                      className={`px-3 py-2 rounded-full text-sm border-2 transition-colors font-semibold ${
                        isSelected
                          ? 'bg-[#5a1f2a] text-white border-[#5a1f2a]'
                          : isDisabled
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-[#5a1f2a] border-[#e3b9b9] hover:border-[#c89292]'
                      }`}
                    >
                      {isSelected && '✓ '}{f}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-[#722f37] uppercase mb-2">📏 Pilih Ukuran</h4>
              <div className="flex flex-col gap-2">
                {sizes.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-3 rounded-xl text-sm border-2 flex justify-between items-center transition-all font-semibold ${
                      selectedSize?.name === s.name
                        ? 'bg-[#5a1f2a] text-white border-[#5a1f2a] shadow-md'
                        : 'bg-white text-[#5a1f2a] border-[#e3b9b9] hover:border-[#c89292]'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="font-bold">
                      Rp {(Number(product.price) + Number(s.price || 0)).toLocaleString('id-ID')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom CTA */}
        <div className="sticky bottom-0 bg-white border-t-2 border-[#fce8e2] px-4 py-3 flex gap-3 items-center shadow-lg">
          <button
            onClick={onClose}
            className="flex-1 bg-[#fce8e2] text-[#5a1f2a] py-3 rounded-full font-semibold text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!inStock}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition-all shadow-md ${
              !inStock
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-[#5a1f2a] hover:bg-[#722f37] text-white hover:shadow-lg'
            }`}
          >
            {!inStock ? 'Stok Habis' : '+ Ke Keranjang'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ProductCard({ product, disabled }) {
  const { addItem } = useCart();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const inStock = product.stock > 0 && !disabled;
  const isSpecial = (product.product_type || 'daily') === 'special';
  const flavors = Array.isArray(product.flavors) ? product.flavors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const hasVariants = flavors.length > 0 || sizes.length > 0;
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
    setAdded(true);
    setShowOptions(false);
    setShowDetail(false);
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
            title={!inStock ? 'Produk habis' : hasVariants ? 'Pilih varian (rasa/ukuran)' : 'Langsung tambah ke keranjang'}
          >
            {!inStock ? 'Habis' : added ? '✓ Ditambahkan!' : hasVariants ? '+ Pilih Varian' : '+ Ke Keranjang'}
          </button>
        </div>
      </div>

      {showOptions && (
        <VariantModal
          product={product}
          flavors={flavors}
          sizes={sizes}
          maxFlavors={product.max_flavors_selectable || 1}
          disabled={disabled}
          onClose={() => setShowOptions(false)}
          onConfirm={(opts) => commitAdd(opts)}
        />
      )}

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
