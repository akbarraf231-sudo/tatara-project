'use client';

import { useCart } from '@/lib/cartContext';

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const inStock = product.stock > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border-2 border-[#e8d5c4]">
      <div className="w-full h-48 bg-[#f7e9d7] flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-amber-400 text-4xl">🥐</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#6b4423] mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-[#8b6f47] mb-3">
          {inStock ? `${product.stock} available` : 'Out of stock'}
        </p>
        <p className="text-2xl font-bold text-[#c8794a] mb-4">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
        <button
          onClick={() => addItem(product)}
          disabled={!inStock}
          className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
            inStock
              ? 'bg-[#c8794a] hover:bg-[#b6663a] text-white'
              : 'bg-gray-300 cursor-not-allowed text-gray-600'
          }`}
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
