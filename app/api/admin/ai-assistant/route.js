import { Anthropic } from '@anthropic-ai/sdk';
import { isAdminAuthorized } from '@/lib/adminAuth';

const client = new Anthropic();

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

    // Prepare messages for Claude - include conversation history
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Stream response dari Claude
    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    // Convert stream to Response
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('AI Assistant error:', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
