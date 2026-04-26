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

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="flex-1 bg-[#fce8e2]">
      {/* HERO SECTION - Split Layout */}
      <section id="home" className="relative overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[90vh]">
          {/* LEFT - Light pink with content */}
          <div className="bg-[#fce8e2] flex items-center px-8 md:px-16 py-16 relative">
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#5a1f2a] leading-tight mb-6">
                Celebrate life&apos;s sweet moments with the perfect cake
              </h1>
              <p className="text-[#722f37] italic mb-8 text-base md:text-lg leading-relaxed">
                &quot;Indulge in a symphony of sweetness, where every bite tells a tale of delight. Our cakes: where dreams are baked and smiles are frosted.&quot;
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <button
                  onClick={() => scrollToSection('gallery')}
                  className="bg-[#5a1f2a] hover:bg-[#722f37] text-white font-semibold py-3 px-8 rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  Shop Now
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="bg-transparent border-2 border-[#5a1f2a] text-[#5a1f2a] hover:bg-[#5a1f2a] hover:text-white font-semibold py-3 px-8 rounded-full transition-all"
                >
                  Customize Now
                </button>
              </div>

              {/* Ingredients */}
              <div>
                <p className="text-[#5a1f2a] font-semibold mb-4">Ingredients :</p>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=200&h=200&fit=crop"
                      alt="Eggs"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop"
                      alt="Flour"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop"
                      alt="Butter"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop"
                      alt="Strawberry"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Dusty pink with cake image */}
          <div className="bg-[#c89292] flex items-center justify-center relative px-8 py-16">
            {/* Floating decorations */}
            <div className="absolute top-8 right-8 text-5xl animate-bounce" style={{ animationDuration: '3s' }}>
              🎈
            </div>
            <div className="absolute bottom-16 left-8 text-4xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
              🎈
            </div>
            <div className="absolute top-1/3 left-12 text-3xl">
              ✨
            </div>

            {/* Arch frame with cake */}
            <div className="relative w-full max-w-md h-[70vh] max-h-[600px]">
              <div
                className="absolute inset-0 bg-[#e3b9b9] overflow-hidden shadow-2xl"
                style={{
                  borderTopLeftRadius: '50%',
                  borderTopRightRadius: '50%',
                  borderBottomLeftRadius: '20px',
                  borderBottomRightRadius: '20px',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=800&fit=crop"
                  alt="Premium Cake"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#e3b9b9] opacity-60"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-[#fce8e2] opacity-70"></div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-20 px-4 bg-[#fce8e2]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center text-[#5a1f2a] mb-16">
            Gallery
          </h2>

          {loading && (
            <div className="text-center py-12">
              <p className="text-[#722f37] text-lg">Loading...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 max-w-md mx-auto">
              {error}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#722f37] text-lg">Belum ada produk</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CART SECTION */}
      <section id="cart" className="py-16 px-4 bg-[#c89292]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-8">
            🛒 Your Cart
          </h2>
          <Cart />
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="py-20 px-4 bg-[#fce8e2]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-[#5a1f2a] mb-6">About Us</h2>
            <p className="text-[#722f37] text-lg leading-relaxed mb-4">
              <strong>Sinar Jaya Bakery</strong> adalah toko kue & roti yang sudah berdiri sejak lama, melayani pelanggan dengan dedikasi tinggi.
            </p>
            <p className="text-[#722f37] text-lg leading-relaxed mb-4">
              Setiap kue dibuat dengan bahan premium dan resep tradisional yang telah disempurnakan selama bertahun-tahun. Kami percaya bahwa setiap momen istimewa pantas dirayakan dengan kue yang sempurna.
            </p>
            <p className="text-[#722f37] text-lg leading-relaxed">
              Pesan custom cake untuk ulang tahun, anniversary, atau perayaan apapun — kami siap mewujudkan kue impian lo!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1606101205803-c5b06d8c5e0d?w=400&h=300&fit=crop"
              alt="Bakery"
              className="rounded-2xl shadow-lg w-full h-48 object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop"
              alt="Cake decoration"
              className="rounded-2xl shadow-lg w-full h-48 object-cover mt-8"
            />
            <img
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop"
              alt="Bakery scene"
              className="rounded-2xl shadow-lg w-full h-48 object-cover -mt-4"
            />
            <img
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop"
              alt="Pastries"
              className="rounded-2xl shadow-lg w-full h-48 object-cover mt-4"
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 bg-[#e3b9b9]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-[#5a1f2a] mb-12">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rina',
                review: 'Kuenya enak banget! Ulang tahun anak gue jadi extra special. Akan order lagi pasti!',
                rating: 5,
              },
              {
                name: 'Budi',
                review: 'Custom cake untuk wedding gue cantik banget, rasanya juga top. Highly recommended!',
                rating: 5,
              },
              {
                name: 'Sarah',
                review: 'Roti & pastry-nya selalu fresh. Service-nya juga ramah, jadi langganan deh!',
                rating: 5,
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex mb-3">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-[#722f37] italic mb-4">&quot;{t.review}&quot;</p>
                <p className="font-bold text-[#5a1f2a]">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / VISIT US */}
      <section id="contact" className="py-20 px-4 bg-[#fce8e2]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-[#5a1f2a] mb-6">Visit Us Today</h2>
          <p className="text-[#722f37] text-lg mb-8 max-w-2xl mx-auto">
            Mampir ke toko kami untuk merasakan langsung aroma kue yang baru keluar dari oven. Open daily 7 AM - 8 PM.
          </p>
          {locationLink && (
            <a
              href={locationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#5a1f2a] hover:bg-[#722f37] text-white font-semibold py-4 px-10 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              📍 View Location
            </a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#5a1f2a] text-[#fce8e2] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-2">Sinar Jaya Bakery</h3>
          <p className="text-[#e3b9b9] mb-6">Freshly baked goodness, delivered with love</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#gallery" className="hover:text-white transition-colors">Cakes</a>
            <a href="#cart" className="hover:text-white transition-colors">Order</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="mt-8 text-xs text-[#c89292]">© 2026 Sinar Jaya Bakery. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
