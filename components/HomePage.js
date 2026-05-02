'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { OrderingGuide } from '@/components/OrderingGuide';
import { FloatingCartBadge } from '@/components/FloatingCartBadge';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/lib/cartContext';

export function HomePage({ initialProducts, initialContent, initialLocationLink, storeStatus, closedMessage }) {
  const [products] = useState(initialProducts || []);
  const [locationLink] = useState(initialLocationLink || '');
  const [content] = useState(initialContent);
  const [splashGone, setSplashGone] = useState(false);
  const isClosed = storeStatus === 'closed';
  const { openCart } = useCart();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shown = sessionStorage.getItem('splash_shown');
    if (shown) {
      setSplashGone(true);
      return;
    }
    const timer = setTimeout(() => setSplashGone(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  const dailyProducts = products.filter((p) => (p.product_type || 'daily') === 'daily');
  const specialProducts = products.filter((p) => p.product_type === 'special');

  return (
    <main className="flex-1 bg-[#fce8e2]">
      {isClosed && (
        <div className="bg-red-500 text-white py-4 px-6 text-center font-semibold">
          🔴 {closedMessage}
        </div>
      )}
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
                  ☀️ Pesan Harian
                </button>
                <button
                  onClick={() => scrollToSection('special')}
                  className="bg-transparent border-2 border-[#5a1f2a] text-[#5a1f2a] hover:bg-[#5a1f2a] hover:text-white font-semibold py-3 px-6 sm:px-8 rounded-full transition-all text-sm sm:text-base"
                >
                  🎂 Pesan Khusus
                </button>
              </div>

              {content.ingredients?.length > 0 && (
                <div>
                  <p className="text-[#5a1f2a] font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Bahan-bahan :</p>
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

      {/* ORDERING GUIDE */}
      <OrderingGuide />

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
              <h3 className="text-2xl sm:text-3xl font-bold text-[#5a1f2a]">Produk Harian</h3>
              <p className="text-xs sm:text-sm text-[#722f37]">Pesan pagi, ambil hari ini juga!</p>
            </div>
          </div>

          {dailyProducts.length === 0 && (
            <div className="text-center py-8 text-[#722f37]">Belum ada daily product</div>
          )}
          {dailyProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {dailyProducts.map((p) => <ProductCard key={p.id} product={p} disabled={isClosed} />)}
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
              <h3 className="text-2xl sm:text-3xl font-bold text-[#5a1f2a]">Pesan Khusus</h3>
              <p className="text-xs sm:text-sm text-[#722f37]">Kue custom & kreasi spesial — butuh pre-order</p>
            </div>
          </div>

          {specialProducts.length === 0 && (
            <div className="text-center py-8 text-[#722f37]">Belum ada special product</div>
          )}
          {specialProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {specialProducts.map((p) => <ProductCard key={p.id} product={p} disabled={isClosed} />)}
            </div>
          )}
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
              📍 Lihat Lokasi
            </a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#5a1f2a] text-[#fce8e2] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-2">Sinar Jaya Bakery</h3>
          <p className="text-[#e3b9b9] mb-6">Kue segar dibuat dengan penuh kasih sayang</p>
          <div className="flex justify-center gap-6 text-sm flex-wrap">
            <a href="#home" className="hover:text-white transition-colors">Beranda</a>
            <a href="#daily" className="hover:text-white transition-colors">Harian</a>
            <a href="#special" className="hover:text-white transition-colors">Khusus</a>
            <button onClick={openCart} className="hover:text-white transition-colors">Pesan</button>
            <a href="#about" className="hover:text-white transition-colors">Tentang</a>
            <a href="#contact" className="hover:text-white transition-colors">Hubungi</a>
          </div>
          <p className="mt-8 text-xs text-[#c89292]">© 2026 Sinar Jaya Bakery. Semua hak dilindungi.</p>
        </div>
      </footer>

      <FloatingCartBadge />
      <CartDrawer disabled={isClosed} />
    </main>
  );
}
