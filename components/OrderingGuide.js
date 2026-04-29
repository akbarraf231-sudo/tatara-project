'use client';

import { useState } from 'react';

export function OrderingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      number: 1,
      title: 'Pilih Produk',
      description: 'Scroll down & pilih kue yang Anda inginkan dari daftar Harian atau Khusus',
      icon: '🍰',
    },
    {
      number: 2,
      title: 'Pilih Varian (jika ada)',
      description: 'Klik tombol "Pilih Varian" untuk memilih rasa & ukuran (jika tersedia)',
      icon: '✨',
    },
    {
      number: 3,
      title: 'Tambah ke Keranjang',
      description: 'Klik "Ke Keranjang" atau "Confirm" di modal pilihan',
      icon: '🛒',
    },
    {
      number: 4,
      title: 'Scroll ke Keranjang',
      description: 'Gulir ke bawah atau klik section "Pesan" di navbar untuk lihat keranjang Anda',
      icon: '📦',
    },
    {
      number: 5,
      title: 'Isi Data Diri',
      description: 'Masukkan nama, nomor WhatsApp, & jam pickup',
      icon: '📝',
    },
    {
      number: 6,
      title: 'Bayar',
      description: 'Klik "Checkout & Bayar" lalu ikuti instruksi pembayaran',
      icon: '💳',
    },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 bg-[#5a1f2a] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all z-50 sm:hidden"
        title="Cara Memesan"
      >
        ❓
      </button>

      {/* Modal/Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#5a1f2a] to-[#722f37] text-white p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">📖 Cara Memesan</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#fce8e2] text-2xl">
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#5a1f2a]">
                      {step.number}. {step.title}
                    </h3>
                    <p className="text-sm text-[#722f37] mt-1">{step.description}</p>
                  </div>
                </div>
              ))}

              <div className="border-t-2 border-[#e3b9b9] pt-4 mt-6">
                <p className="text-xs text-[#722f37] text-center">
                  💡 <span className="font-semibold">Tips:</span> Pastikan nomor WhatsApp benar agar kami bisa hubungi Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Version - inline in page */}
      <section className="hidden sm:block py-12 bg-gradient-to-r from-[#fce8e2] to-[#e3b9b9] px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#5a1f2a] text-center mb-8">📖 Cara Memesan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={step.number} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{step.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#5a1f2a] mb-2">
                      {step.number}. {step.title}
                    </h3>
                    <p className="text-sm text-[#722f37]">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
            <p className="text-[#5a1f2a] font-semibold mb-2">💡 Butuh Bantuan?</p>
            <p className="text-sm text-[#722f37]">
              Hubungi kami via WhatsApp jika ada pertanyaan atau masalah saat memesan
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
