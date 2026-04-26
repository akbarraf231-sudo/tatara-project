'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ProductCard } from '@/components/ProductCard';
import { Cart } from '@/components/Cart';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationLink, setLocationLink] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: prods, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('id');

        if (prodError) throw prodError;
        setProducts(prods || []);

        const { data: settings } = await supabase
          .from('settings')
          .select('location_link')
          .single();

        if (settings?.location_link) {
          setLocationLink(settings.location_link);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="flex-1 bg-[#f5ebe0]">
      {/* Hero Section */}
      <section className="border-b-4 border-amber-900">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center min-h-[500px]">
          {/* Left - Image */}
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=500&fit=crop"
              alt="Freshly baked croissants"
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* Right - Content */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-[#6b4423] mb-4">
              Freshly Baked,<br />Just for You!
            </h1>
            <p className="text-lg text-[#8b6f47] mb-8 leading-relaxed">
              Discover our artisanal collection of freshly baked goods crafted with premium ingredients and love. From croissants to custom cakes, we have something special for every occasion.
            </p>
            <button
              onClick={() => {
                document.querySelector('[data-menu-section]')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#c8794a] hover:bg-[#b6663a] text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              ORDER NOW
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white border-b-4 border-amber-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#6b4423] mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop"
                alt="Artisan Breads"
                className="w-full h-64 object-cover rounded-xl mb-4 shadow-md"
              />
              <h3 className="text-2xl font-bold text-[#6b4423] mb-2">Artisan Breads</h3>
              <p className="text-[#8b6f47]">
                Handcrafted loaves made with traditional techniques and the finest flour
              </p>
            </div>

            {/* Card 2 */}
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1542826438-1f2c2f1c4c4c?w=400&h=300&fit=crop"
                alt="Sweet Pastries"
                className="w-full h-64 object-cover rounded-xl mb-4 shadow-md"
              />
              <h3 className="text-2xl font-bold text-[#6b4423] mb-2">Sweet Pastries</h3>
              <p className="text-[#8b6f47]">
                Delicate pastries filled with seasonal fruits and premium chocolate
              </p>
            </div>

            {/* Card 3 */}
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
                alt="Custom Cakes"
                className="w-full h-64 object-cover rounded-xl mb-4 shadow-md"
              />
              <h3 className="text-2xl font-bold text-[#6b4423] mb-2">Custom Cakes</h3>
              <p className="text-[#8b6f47]">
                Personalized cakes for every celebration, baked fresh to order
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Us Today */}
      <section className="border-b-4 border-amber-900 py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          {/* Left - Text */}
          <div>
            <h2 className="text-4xl font-bold text-[#6b4423] mb-6">Visit Us Today</h2>
            <p className="text-lg text-[#8b6f47] mb-6 leading-relaxed">
              Experience the aroma and warmth of our bakery. Stop by to enjoy fresh pastries with a hot cup of coffee, or pick up your favorite treats for any occasion.
            </p>
            <p className="text-lg text-[#8b6f47] mb-8">
              Open daily from 7 AM to 8 PM. We're located in the heart of the city, easy to find and easy to love.
            </p>
            {locationLink && (
              <a
                href={locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#c8794a] hover:bg-[#b6663a] text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                📍 VIEW LOCATION
              </a>
            )}
          </div>

          {/* Right - Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop"
              alt="Donuts"
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
            <img
              src="https://images.unsplash.com/photo-1599599810694-b5ac4dd64fbb?w=300&h=300&fit=crop"
              alt="Pastries"
              className="w-full h-48 object-cover rounded-lg shadow-md row-span-2"
            />
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop"
              alt="Cake"
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Products & Cart Section */}
      <section data-menu-section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products */}
            <div className="lg:col-span-2">
              <h2 className="text-4xl font-bold text-[#6b4423] mb-8">Our Menu</h2>

              {loading && (
                <div className="text-center py-12">
                  <p className="text-[#8b6f47] text-lg">Loading products...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700">
                  Error loading products: {error}
                </div>
              )}

              {!loading && products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#8b6f47] text-lg">No products available yet</p>
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

            {/* Cart */}
            <div className="lg:col-span-1" data-cart-toggle>
              <Cart />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
