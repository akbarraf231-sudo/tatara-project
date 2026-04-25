'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ProductCard } from '@/components/ProductCard';
import { Cart } from '@/components/Cart';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('id');

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-100 to-amber-50 border-b-2 border-amber-900">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-amber-900 rounded-full flex items-center justify-center">
            <span className="text-5xl text-amber-50 font-bold">🥐</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-3">
            Sinar Jaya Bakery
          </h2>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            Freshly baked goodness, delivered with love. Order your favorites now!
          </p>
        </div>
      </section>

      {/* Products and Cart Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-amber-900 mb-6">Our Products</h3>

            {loading && (
              <div className="text-center py-12">
                <p className="text-amber-700">Loading products...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Error loading products: {error}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-amber-700">No products available yet</p>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1" data-cart-toggle>
            <Cart />
          </div>
        </div>
      </div>
    </main>
  );
}
