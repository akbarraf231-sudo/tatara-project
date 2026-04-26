'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ProductCard } from '@/components/ProductCard';
import { Cart } from '@/components/Cart';

const DEFAULT_INGREDIENTS = [
  { name: 'Eggs', image_url: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=200&h=200&fit=crop' },
  { name: 'Flour', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop' },
  { name: 'Butter', image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop' },
  { name: 'Strawberry', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop' },
];

const DEFAULT_TESTIMONIALS = [
  { name: 'Rina', review: 'Kuenya enak banget! Akan order lagi pasti!', rating: 5 },
  { name: 'Budi', review: 'Custom cake-nya cantik banget, rasanya juga top!', rating: 5 },
  { name: 'Sarah', review: 'Roti & pastry-nya selalu fresh. Highly recommended!', rating: 5 },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationLink, setLocationLink] = useState('');
  const [content, setContent] = useState({
    hero_title: 'Celebrate life\'s sweet moments with the perfect cake',
    hero_subtitle: 'Indulge in a symphony of sweetness, where every bite tells a tale of delight.',
    hero_image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=800&fit=crop',
    about_title: 'About Us',
    about_text: 'Sinar Jaya Bakery adalah toko kue & roti yang sudah berdiri sejak lama, melayani pelanggan dengan dedikasi tinggi. Setiap kue dibuat dengan bahan premium dan resep tradisional.',
    about_image_1: 'https://images.unsplash.com/photo-1606101205803-c5b06d8c5e0d?w=400&h=300&fit=crop',
    about_image_2: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop',
    about_image_3: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    about_image_4: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    cakes_title: 'Our Menu',
    cakes_subtitle: 'Pilih daily fresh atau special order',
    order_title: 'Your Cart',
    contact_title: 'Visit Us Today',
    contact_text: 'Mampir ke toko kami untuk merasakan langsung aroma kue. Open daily 7 AM - 8 PM.',
    testimonials: DEFAULT_TESTIMONIALS,
    ingredients: DEFAULT_INGREDIENTS,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: prods, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (prodError) throw prodError;
        setProducts(prods || []);

        const { data: settings } = await supabase
          .from('settings')
          .select('location_link')
          .limit(1)
          .maybeSingle();
        if (settings?.location_link) setLocationLink(settings.location_link);

        const lc = await fetch('/api/landing').then((r) => r.json()).catch(() => null);
        if (lc?.success && lc.data) {
          const d = lc.data;
          setContent((prev) => ({
            hero_title: d.hero_title || prev.hero_title,
            hero_subtitle: d.hero_subtitle || prev.hero_subtitle,
            hero_image_url: d.hero_image_url || prev.hero_image_url,
            about_title: d.about_title || prev.about_title,
            about_text: d.about_text || prev.about_text,
            about_image_1: d.about_image_1 || prev.about_image_1,
            about_image_2: d.about_image_2 || prev.about_image_2,
            about_image_3: d.about_image_3 || prev.about_image_3,
            about_image_4: d.about_image_4 || prev.about_image_4,
            cakes_title: d.cakes_title || prev.cakes_title,
            cakes_subtitle: d.cakes_subtitle || prev.cakes_subtitle,
            order_title: d.order_title || prev.order_title,
            contact_title: d.contact_title || prev.contact_title,
            contact_text: d.contact_text || prev.contact_text,
            testimonials: Array.isArray(d.testimonials) && d.testimonials.length ? d.testimonials : prev.testimonials,
            ingredients: Array.isArray(d.ingredients) && d.ingredients.length ? d.ingredients : prev.ingredients,
          }));
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

  const dailyProducts = products.filter((p) => (p.product_type || 'daily') === 'daily');
  const specialProducts = products.filter((p) => p.product_type === 'special');

  return (
    <main className="flex-1 bg-[#fce8e2]">
      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <div className="grid md:grid-cols-2 md:min-h-[90vh]">
          <div className="bg-[#fce8e2] flex items-center px-6 sm:px-8 md:px-16 py-10 md:py-16 relative order-2 md:order-1">
            <div className="max-w-lg w-full">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#5a1f2a] leading-tight mb-4 sm:mb-6">
                {content.hero_title}
              </h1>
              <p className="text-[#722f37] italic mb-6 sm:mb-8 text-sm sm:text-base md:text-lg leading-relaxed">
                &quot;{content.hero_subtitle}&quot;
              </p>

              <div className="flex flex-wrap gap-3 mb-8 sm:mb-12">
                <button
                  onClick={() => scrollToSection('daily')}
                  className="bg-[#5a1f2a] hover:bg-[#722f37] text-white font-semibold py-3 px-6 sm:px-8 rounded-full transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  ☀️ Daily Order
                </button>
                <button
                  onClick={() => scrollToSection('special')}
                  className="bg-transparent border-2 border-[#5a1f2a] text-[#5a1f2a] hover:bg-[#5a1f2a] hover:text-white font-semibold py-3 px-6 sm:px-8 rounded-full transition-all text-sm sm:text-base"
                >
                  🎂 Special Order
                </button>
              </div>

              {content.ingredients?.length > 0 && (
                <div>
                  <p className="text-[#5a1f2a] font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Ingredients :</p>
                  <div className="flex gap-3 sm:gap-4 items-center flex-wrap">
                    {content.ingredients.slice(0, 6).map((ing, i) => (
                      <div key={i} className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md overflow-hidden" title={ing.name}>
                        {ing.image_url ? (
                          <img src={ing.image_url} alt={ing.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🥚</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#c89292] flex items-center justify-center relative px-6 sm:px-8 py-10 md:py-16 order-1 md:order-2 min-h-[50vh] md:min-h-0">
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 text-4xl sm:text-5xl animate-bounce" style={{ animationDuration: '3s' }}>🎈</div>
            <div className="absolute bottom-8 sm:bottom-16 left-4 sm:left-8 text-3xl sm:text-4xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>🎈</div>
            <div className="absolute top-1/3 left-8 sm:left-12 text-2xl sm:text-3xl">✨</div>

            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md h-[40vh] md:h-[70vh] max-h-[600px]">
              <div
                className="absolute inset-0 bg-[#e3b9b9] overflow-hidden shadow-2xl"
                style={{
                  borderTopLeftRadius: '50%',
                  borderTopRightRadius: '50%',
                  borderBottomLeftRadius: '20px',
                  borderBottomRightRadius: '20px',
                }}
              >
                {content.hero_image_url && (
                  <img src={content.hero_image_url} alt="Premium Cake" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#e3b9b9] opacity-60"></div>
              <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#fce8e2] opacity-70"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CAKES INTRO */}
      <section id="cakes" className="pt-12 sm:pt-20 pb-6 sm:pb-8 px-4 bg-[#fce8e2]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#5a1f2a] mb-2 sm:mb-3">
            {content.cakes_title}
          </h2>
          <p className="text-[#722f37] text-sm sm:text-lg">{content.cakes_subtitle}</p>
        </div>
      </section>

      {/* DAILY PRODUCTS */}
      <section id="daily" className="py-10 sm:py-16 px-4 bg-[#fce8e2]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="text-2xl sm:text-3xl">☀️</span>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#5a1f2a]">Daily Fresh</h3>
              <p className="text-xs sm:text-sm text-[#722f37]">Order pagi, pickup hari ini juga!</p>
            </div>
          </div>

          {loading && <p className="text-center text-[#722f37]">Loading...</p>}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 max-w-md mx-auto">{error}</div>
          )}
          {!loading && dailyProducts.length === 0 && (
            <div className="text-center py-8 text-[#722f37]">Belum ada daily product</div>
          )}
          {dailyProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {dailyProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* SPECIAL PRODUCTS */}
      <section id="special" className="py-10 sm:py-16 px-4 bg-[#e3b9b9]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="text-2xl sm:text-3xl">🎂</span>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#5a1f2a]">Special Order</h3>
              <p className="text-xs sm:text-sm text-[#722f37]">Custom cake & special creations — pre-order required</p>
            </div>
          </div>

          {!loading && specialProducts.length === 0 && (
            <div className="text-center py-8 text-[#722f37]">Belum ada special product</div>
          )}
          {specialProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {specialProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* CART */}
      <section id="cart" className="py-10 sm:py-16 px-3 sm:px-4 bg-[#c89292]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-center text-white mb-6 sm:mb-8">🛒 {content.order_title}</h2>
          <Cart />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-12 sm:py-20 px-4 bg-[#fce8e2]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#5a1f2a] mb-4 sm:mb-6">{content.about_title}</h2>
            <p className="text-[#722f37] text-sm sm:text-lg leading-relaxed whitespace-pre-line">
              {content.about_text}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[content.about_image_1, content.about_image_2, content.about_image_3, content.about_image_4]
              .filter(Boolean)
              .map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`About ${i + 1}`}
                  className={`rounded-2xl shadow-lg w-full h-32 sm:h-48 object-cover ${i % 2 === 1 ? 'mt-4 sm:mt-8' : ''}`}
                />
              ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — Grab/Gofood style */}
      <section className="py-12 sm:py-20 px-0 bg-[#e3b9b9] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 mb-6 sm:mb-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-[#5a1f2a] mb-2">⭐ Apa Kata Mereka</h2>
            <p className="text-sm sm:text-base text-[#722f37]">Review jujur dari pelanggan setia Sinar Jaya</p>
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {content.testimonials.map((t, i) => {
              const initial = (t.name || '?').trim().charAt(0).toUpperCase();
              const colors = ['bg-orange-400', 'bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400'];
              const avatarColor = colors[i % colors.length];
              const rating = t.rating || 5;
              return (
                <div
                  key={i}
                  className="snap-start shrink-0 w-72 sm:w-80 bg-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-lg shrink-0`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#5a1f2a] text-sm sm:text-base truncate">{t.name}</p>
                      <div className="flex items-center gap-1">
                        {Array(rating).fill(0).map((_, j) => (
                          <span key={j} className="text-yellow-400 text-sm">⭐</span>
                        ))}
                        <span className="text-xs text-[#722f37] ml-1">({rating}.0)</span>
                      </div>
                    </div>
                    <span className="text-xl sm:text-2xl">💬</span>
                  </div>
                  <p className="text-[#722f37] text-sm leading-relaxed flex-1">&quot;{t.review}&quot;</p>
                  <div className="mt-3 pt-3 border-t border-[#fce8e2] flex items-center gap-2 text-xs text-[#c89292]">
                    <span>✓ Verified Customer</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-[#722f37] mt-2 px-4">← Geser untuk lihat lebih banyak →</p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-12 sm:py-20 px-4 bg-[#fce8e2]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-[#5a1f2a] mb-4 sm:mb-6">{content.contact_title}</h2>
          <p className="text-[#722f37] text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">{content.contact_text}</p>
          {locationLink && (
            <a
              href={locationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#5a1f2a] hover:bg-[#722f37] text-white font-semibold py-3 sm:py-4 px-8 sm:px-10 rounded-full transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
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
          <div className="flex justify-center gap-6 text-sm flex-wrap">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#daily" className="hover:text-white transition-colors">Daily</a>
            <a href="#special" className="hover:text-white transition-colors">Special</a>
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
