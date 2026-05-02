'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function ProductDetailModal({ product, onClose, onAddToCart, disabled }) {
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [mounted, setMounted] = useState(false);

  const flavors = Array.isArray(product.flavors) ? product.flavors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const maxFlavors = product.max_flavors_selectable || 1;
  const productImages = [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean);
  const isSpecial = (product.product_type || 'daily') === 'special';
  const inStock = product.stock > 0 && !disabled;
  const hasVariants = flavors.length > 0 || sizes.length > 0;
  const totalPrice = (Number(product.price) + Number(selectedSize?.price || 0)) * qty;

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

  function handleAdd() {
    if (!inStock) return;
    if (flavors.length > 0 && selectedFlavors.length === 0) {
      alert('Pilih varian rasa dulu');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      alert('Pilih ukuran dulu');
      return;
    }
    onAddToCart({
      flavor: selectedFlavors.join(', ') || null,
      size: selectedSize,
      qty,
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-drawer-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header dengan close button */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 flex items-center justify-between border-b border-[#fce8e2]">
          <h2 className="font-bold text-[#5a1f2a] flex-1 truncate pr-2">Detail Produk</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#fce8e2] hover:bg-[#e3b9b9] flex items-center justify-center text-2xl leading-none text-[#5a1f2a]"
            title="Tutup"
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
          <div className="relative w-full aspect-square max-h-80 flex items-center justify-center overflow-hidden rounded-2xl">
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

          {/* Thumbnail row */}
          {productImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
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
        <div className="px-4 py-4 flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-[#5a1f2a] mb-2">{product.name}</h3>
          <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-[#fce8e2]">
            <p className="text-2xl sm:text-3xl font-bold text-[#5a1f2a]">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </p>
            <p className={`text-xs font-semibold px-3 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {inStock ? `Stok: ${product.stock}` : 'Habis'}
            </p>
          </div>

          {/* Description */}
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

          {/* Quantity Selector */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-[#722f37] uppercase mb-2">🔢 Jumlah</h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#fce8e2] rounded-full p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-9 h-9 rounded-full bg-[#e3b9b9] hover:bg-[#c89292] disabled:opacity-50 flex items-center justify-center text-white font-bold text-lg"
                >−</button>
                <span className="w-12 text-center font-bold text-[#5a1f2a] text-lg">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  className="w-9 h-9 rounded-full bg-[#5a1f2a] hover:bg-[#722f37] disabled:opacity-50 flex items-center justify-center text-white font-bold text-lg"
                >+</button>
              </div>
              <p className="text-xs text-[#722f37]">Maks. {product.stock}</p>
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="sticky bottom-0 bg-white border-t-2 border-[#fce8e2] px-4 py-3 flex gap-3 items-center shadow-lg">
          <div className="flex-1">
            <p className="text-[10px] text-[#722f37] uppercase font-semibold">Total</p>
            <p className="text-xl font-bold text-[#5a1f2a]">Rp {totalPrice.toLocaleString('id-ID')}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className={`flex-[1.5] py-3 px-4 rounded-full font-bold text-sm sm:text-base transition-all shadow-md ${
              !inStock
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-[#5a1f2a] hover:bg-[#722f37] text-white hover:shadow-lg'
            }`}
          >
            {!inStock ? 'Stok Habis' : '+ Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
