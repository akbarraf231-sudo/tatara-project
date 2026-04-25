'use client';

import { useCart } from '@/lib/cartContext';

export function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-blue-600 mb-4">
          ${product.price.toFixed(2)}
        </p>
        <button
          onClick={() => addItem(product)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
