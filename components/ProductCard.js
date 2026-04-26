'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const inStock = product.stock > 0;

  function handleAdd() {
    if (!inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="bg-[#e3b9b9] rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
      {/* Image Section */}
      <div className="relative bg-[#fce8e2] p-4 pt-6">
        <button
          onClick={(e) => { e.stopPropagation(); setFavorite(!favorite); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
          title="Favorite"
        >
          {favorite ? (
            <span className="text-red-500 text-lg">♥</span>
          ) : (
            <span className="text-[#c89292] text-lg">♡</span>
          )}
        </button>

        <div className="w-full h-48 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="text-7xl">🍰</div>
          )}
        </div>
      </div>

      {/* Info Bottom Band */}
      <div className="bg-[#c89292] p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg truncate flex-1">{product.name}</h3>
        </div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-lg font-bold">
            Rp {Number(product.price).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-[#fce8e2]">
            {inStock ? `Stok: ${product.stock}` : 'Habis'}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className={`w-full py-2 px-4 rounded-full font-semibold transition-all text-sm ${
            !inStock
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : added
              ? 'bg-green-500 text-white'
              : 'bg-[#5a1f2a] hover:bg-[#722f37] text-white'
          }`}
        >
          {!inStock ? 'Out of Stock' : added ? '✓ Added!' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}
