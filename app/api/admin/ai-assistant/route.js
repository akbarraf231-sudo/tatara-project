import { isAdminAuthorized } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `Anda adalah asisten AI untuk Sinar Jaya Bakery Admin - sistem manajemen bakery online.

Anda membantu owner pemula memahami dan menggunakan sistem ini. Jawab pertanyaan dalam Bahasa Indonesia yang ramah dan jelas.

## Fitur Sistem:

### Products Management
- Tambah produk Daily (tersedia hari ini) atau Special (pre-order H-3)
- Upload foto produk
- Set harga, deskripsi, stok
- Pilih varian: rasa (vanilla, coklat, matcha, dll) dan ukuran

### Orders
- Customer order via website, pilih produk + varian + pickup time
- Admin lihat order di dashboard
- Confirm via WhatsApp ke nomor customer
- Proses pembayaran (cash/transfer)
- Update status order

### Inventory (Pembelian)
- Catat pembelian bahan baku: quantity × unit_price
- Subtotal dihitung otomatis di server
- Pantau stok produk, alert saat low stock
- Prediksi kapan akan kehabisan

### Penjualan & Laporan
- Dashboard lihat revenue, order count, profit
- Analytics: produk paling laris, hari penjualan terbanyak
- Export laporan penjualan

### Settings
- Set nomor WhatsApp (untuk terima order)
- Upload logo toko
- Set Google Maps location
- Set QRIS payment image
- Lead time untuk special order

## Saran untuk Owner Baru:
1. Mulai dengan 5-10 produk favorit Anda
2. Set harga dengan margin 40-60% dari cost
3. Focus pada Daily products dulu, perlahan tambah Special
4. Reply WhatsApp cepat = lebih banyak repeat customer
5. Update stok real-time agar jangan oversell
6. Monitor hari apa penjualan terbanyak, stock lebih banyak

Jika ditanya hal yang tidak tahu, katakan "Maaf, saya belum tahu tentang itu. Hubungi support Sinar Jaya."

Jawab singkat, praktis, dan helpful. Jika pertanyaan teknis rumit, tawarkan untuk chat dengan support.`;

const FALLBACK_RESPONSES = [
  {
    keywords: ['cara pakai', 'cara guna', 'pakai fitur', 'guna fitur', 'gimana pakai', 'how to use'],
    response: `📚 **Cara Pakai Sistem:**

1. **Dashboard** — Lihat ringkasan revenue, profit, dan order
2. **Orders** — Kelola order masuk, confirm via WhatsApp
3. **Products** — Tambah/edit produk Daily atau Special
4. **Vouchers** — Buat kode diskon untuk customer
5. **Expenses** — Catat pembelian bahan & operasional
6. **Landing Page** — Edit konten halaman utama
7. **Settings** — Set WhatsApp, logo, QRIS payment

Klik tab di atas untuk navigasi. Mulai dari Settings dulu untuk setup awal!`,
  },
  {
    keywords: ['produk', 'product', 'tambah produk', 'add product'],
    response: `🍰 **Manage Produk:**

1. Buka tab **Products**
2. Klik "Tambah Produk"
3. Pilih tipe: **Daily** (siap hari ini) atau **Special** (pre-order H-3)
4. Isi nama, harga, deskripsi, stok
5. Upload foto produk (penting untuk menarik customer!)
6. Set varian rasa & ukuran kalau ada
7. Save

💡 Tip: Mulai dengan 5-10 produk favorit dulu, jangan langsung banyak.`,
  },
  {
    keywords: ['order', 'pesanan', 'terima order', 'cara order'],
    response: `📦 **Manage Orders:**

1. Customer order dari website → masuk ke tab **Orders**
2. Lihat detail order: produk, jumlah, pickup time, customer info
3. Klik "Confirm" → otomatis buka WhatsApp ke customer
4. Konfirmasi pembayaran (cash / transfer / QRIS)
5. Update status: pending → confirmed → completed

⚡ **Tip:** Reply WhatsApp dalam 5 menit pertama untuk repeat order lebih banyak!`,
  },
  {
    keywords: ['inventory', 'stok', 'stock', 'pembelian', 'belanja bahan'],
    response: `📦 **Inventory & Pembelian:**

**Pantau Stok:**
- Tab **Inventory** di Dashboard menampilkan status semua produk
- Alert otomatis kalau stok di bawah threshold
- Prediksi kapan stok akan habis

**Catat Pembelian:**
- Tab **Expenses** → kategori "purchase"
- Isi quantity × unit_price → subtotal otomatis
- Sistem hitung total expense bulan ini

💡 Set restock_threshold per produk supaya alert lebih akurat!`,
  },
  {
    keywords: ['harga', 'pricing', 'set harga', 'margin'],
    response: `💰 **Tips Pricing:**

1. Hitung **cost** total: bahan + tenaga + operasional
2. Tambah margin **40-60%** untuk profit yang sehat
3. Cek harga kompetitor sekitar
4. Round number yang mudah diingat (mis. Rp 25.000 vs Rp 24.750)

**Contoh:**
- Cost roti: Rp 8.000
- Margin 50%: harga jual Rp 12.000
- Profit per item: Rp 4.000

📊 Pantau **Insights** untuk lihat margin profit aktual!`,
  },
  {
    keywords: ['whatsapp', 'wa', 'nomor wa', 'set whatsapp'],
    response: `📱 **Setup WhatsApp:**

1. Buka tab **Settings**
2. Field "WhatsApp Order" → nomor untuk terima order customer
3. Field "WhatsApp CS" → nomor untuk customer service (optional)
4. Format: 628123456789 (tanpa + atau spasi)
5. Save

Customer akan diarahkan ke WA ini saat checkout.`,
  },
  {
    keywords: ['voucher', 'diskon', 'discount', 'promo'],
    response: `🎟️ **Buat Voucher:**

1. Tab **Vouchers** → "Tambah Voucher"
2. Set kode (mis. NEWBIE10, RAMADHAN20)
3. Pilih tipe: % (persen) atau fixed (Rp)
4. Set min order, max diskon, masa berlaku
5. Aktifkan voucher

Customer input kode di checkout → diskon otomatis applied.`,
  },
  {
    keywords: ['daily', 'special', 'beda', 'difference'],
    response: `☀️ **Daily vs 🎂 Special Order:**

**Daily:**
- Produk tersedia hari ini
- Customer pesan pagi, pickup sore
- Cocok untuk roti, kue harian
- Stok terbatas per hari

**Special:**
- Pre-order, butuh **H-3** atau lebih (lead time)
- Cocok untuk birthday cake, kue custom
- Tidak ada batas stok harian
- Customer bayar uang muka

💡 Mulai dengan Daily dulu, tambah Special setelah operasional stabil.`,
  },
  {
    keywords: ['profit', 'untung', 'keuntungan', 'revenue'],
    response: `📈 **Analisis Profit:**

Buka **Dashboard → tab Insights**:

- **Revenue** = total uang masuk dari order confirmed/completed
- **Expenses** = pembelian bahan + biaya operasional
- **Profit** = Revenue − Expenses
- **Margin** = (Profit / Revenue) × 100%

🎯 **Target margin sehat: 30-50%**
- < 20%: harga kurang, atau cost terlalu tinggi
- 30-50%: ideal untuk bakery
- > 60%: bagus tapi cek apakah harga masih kompetitif`,
  },
  {
    keywords: ['mulai', 'pertama kali', 'newbie', 'pemula', 'start', 'getting started'],
    response: `🚀 **Panduan Owner Baru:**

**Setup awal (1-2 jam):**
1. Settings → set nomor WhatsApp & upload logo
2. Settings → upload QRIS untuk payment
3. Landing Page → edit hero title & deskripsi toko

**First products (1 jam):**
4. Products → tambah 5-10 produk favorit Anda
5. Set harga dengan margin 40-50%
6. Upload foto yang menarik

**Test order:**
7. Buka view site → coba order sebagai customer
8. Cek di Orders → pastikan masuk
9. Reply WhatsApp test

**Go live:**
10. Share link toko ke teman & social media
11. Pantau Dashboard untuk lihat performa

Cek tab **Onboarding** di Dashboard untuk checklist lengkap!`,
  },
];

function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  for (const item of FALLBACK_RESPONSES) {
    if (item.keywords.some((kw) => lowerMsg.includes(kw))) {
      return item.response;
    }
  }
  return `👋 Halo! Saya bisa bantu jawab pertanyaan tentang:

• **Cara pakai fitur** — navigasi sistem
• **Manage produk** — tambah/edit produk
• **Orders** — terima & confirm order
• **Inventory & stok** — pantau bahan baku
• **Pricing & margin** — set harga produk
• **WhatsApp setup** — config nomor WA
• **Voucher & promo** — buat diskon
• **Daily vs Special** — tipe produk
• **Profit & analytics** — analisis keuangan
• **Mulai dari mana** — panduan owner baru

Coba tanya salah satu topik di atas!

💡 *Untuk fitur AI lebih lengkap, set ANTHROPIC_API_KEY di .env.local*`;
}

function isApiKeyConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return key && key.length > 10;
}

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isApiKeyConfigured()) {
      const fallbackText = getFallbackResponse(message);
      return new Response(fallbackText, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Map conversation history to Gemini format
    const contents = [
      ...conversationHistory.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      let errMsg = `Gemini API error ${geminiRes.status}`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error?.message || errMsg;
      } catch {}
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('AI Assistant error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
