'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const inStock = product.stock > 0;
  const isSpecial = (product.product_type || 'daily') === 'special';
  const flavors = Array.isArray(product.flavors) ? product.flavors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const hasVariants = flavors.length > 0 || sizes.length > 0;

  function commitAdd() {
    if (!inStock) return;
    if (flavors.length > 0 && !selectedFlavor) {
      alert('Pilih varian rasa dulu');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      alert('Pilih ukuran dulu');
      return;
    }
    addItem(product, {
      flavor: selectedFlavor || null,
      size: selectedSize?.name || null,
      sizePriceDelta: selectedSize?.price || 0,
    });
    setAdded(true);
    setShowOptions(false);
    setSelectedFlavor('');
    setSelectedSize(null);
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
    <div className="bg-[#e3b9b9] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group relative">
      {isSpecial && (
        <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
          🎂 SPECIAL
        </div>
      )}
      <div className="relative bg-[#fce8e2] p-4 pt-6">
        <button
          onClick={(e) => { e.stopPropagation(); setFavorite(!favorite); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
          title="Favorite"
        >
          {favorite ? <span className="text-red-500 text-lg">♥</span> : <span className="text-[#c89292] text-lg">♡</span>}
        </button>

        <div className="w-full h-48 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <div className="text-7xl">{isSpecial ? '🎂' : '🍰'}</div>
          )}
        </div>
      </div>

      <div className="bg-[#c89292] p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg truncate flex-1">{product.name}</h3>
        </div>
        {product.description && (
          <p className="text-xs text-[#fce8e2] mb-2 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-lg font-bold">Rp {Number(product.price).toLocaleString('id-ID')}</p>
          <p className="text-xs text-[#fce8e2]">{inStock ? `Stok: ${product.stock}` : 'Habis'}</p>
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
          {!inStock ? 'Out of Stock' : added ? '✓ Added!' : hasVariants ? '+ Pilih Varian' : '+ Add to Cart'}
        </button>
      </div>

      {showOptions && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowOptions(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-[#5a1f2a]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4">{product.name}</h3>

            {flavors.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Pilih Rasa:</p>
                <div className="flex flex-wrap gap-2">
                  {flavors.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFlavor(f)}
                      className={`px-3 py-1.5 rounded-full text-sm border-2 ${
                        selectedFlavor === f ? 'bg-[#5a1f2a] text-white border-[#5a1f2a]' : 'bg-white text-[#5a1f2a] border-[#e3b9b9]'
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
                <p className="font-semibold mb-2">Pilih Ukuran:</p>
                <div className="flex flex-col gap-2">
                  {sizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-2 rounded-lg text-sm border-2 flex justify-between ${
                        selectedSize?.name === s.name ? 'bg-[#5a1f2a] text-white border-[#5a1f2a]' : 'bg-white text-[#5a1f2a] border-[#e3b9b9]'
                      }`}
                    >
                      <span>{s.name}</span>
                      <span>Rp {(Number(product.price) + Number(s.price || 0)).toLocaleString('id-ID')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowOptions(false)} className="flex-1 bg-[#fce8e2] text-[#5a1f2a] py-2 rounded-full font-semibold">
                Batal
              </button>
              <button onClick={commitAdd} className="flex-1 bg-[#5a1f2a] text-white py-2 rounded-full font-semibold">
                + Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
