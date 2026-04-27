-- Hapus tips lama dan ganti dengan konten yang lebih lengkap
delete from owner_tips;

insert into owner_tips (category, title, description, icon, priority) values
  -- Getting Started
  ('getting-started', 'Selamat Datang di Sinar Jaya Admin!', 'Ini adalah sistem untuk manage toko bakery Anda. Di sini Anda bisa tambah produk, terima order dari customer, catat pengeluaran, dan pantau keuntungan secara real-time. Mulai dari Settings dulu ya!', '👋', 100),
  ('getting-started', 'Navigasi Dashboard', 'Di bagian atas ada tab: Dashboard (statistik), Orders (pesanan masuk), Products (kelola produk), Expenses (pengeluaran), Vouchers (diskon), Landing Page (tampilan toko), Settings (pengaturan). Klik tab untuk berpindah halaman.', '🗺️', 95),
  ('getting-started', 'Daily vs Pesan Khusus', 'HARIAN: produk tersedia hari ini, customer pesan pagi bisa ambil sore. KHUSUS: butuh pre-order minimal H-3, cocok untuk kue ulang tahun atau kue custom. Mulai dengan produk Harian dulu!', '☀️', 90),

  -- Setup
  ('setup', 'Setup Pertama: WhatsApp & Logo', 'Buka tab Settings → isi nomor WhatsApp (format: 628123456789) → upload logo toko. Ini penting karena semua notif order akan dikirim ke WA tersebut. Jangan sampai nomor salah!', '⚙️', 88),
  ('setup', 'Setup Pembayaran QRIS', 'Di Settings, upload foto QRIS Anda. Customer akan melihat QR ini saat checkout. Pastikan foto QR jelas dan mudah di-scan. Ini cara termudah terima pembayaran digital!', '💳', 85),
  ('setup', 'Set Lokasi Toko di Google Maps', 'Di Settings, isi link Google Maps lokasi toko Anda. Customer bisa langsung klik untuk navigasi ke toko. Cara dapat link: buka toko di Google Maps → Share → Copy link.', '📍', 82),

  -- First Product
  ('first-product', 'Cara Tambah Produk Pertama', 'Buka Products → klik Tambah Produk → isi nama, harga, stok, deskripsi → upload foto → pilih tipe (Harian/Khusus) → Save. Tips: foto yang bagus = lebih banyak yang tertarik beli!', '🎂', 80),
  ('first-product', 'Tips Foto Produk yang Menarik', 'Foto produk adalah hal pertama yang dilihat customer! Tips: gunakan cahaya alami (dekat jendela), latar belakang polos/putih, foto dari atas atau 45 derajat, tampilkan detail produk dengan jelas.', '📸', 78),
  ('first-product', 'Cara Set Varian Rasa & Ukuran', 'Saat tambah/edit produk, ada bagian Varian. Klik + untuk tambah pilihan rasa (vanilla, coklat, dll) atau ukuran (loyang 20cm, 22cm, dll). Customer bisa pilih varian saat checkout.', '🍰', 75),

  -- Sales & Pricing
  ('sales', 'Cara Hitung Harga yang Tepat', 'Hitung dulu BIAYA per item: bahan baku + gas/listrik + tenaga kerja. Lalu tambahkan MARGIN 40-60%. Contoh: biaya Rp 8.000 → harga jual Rp 12.000-13.000. Jangan terlalu murah, jangan terlalu mahal!', '💰', 72),
  ('sales', 'Pantau Revenue di Dashboard', 'Tab Dashboard → Insights menampilkan: Revenue hari ini & bulan ini, Profit (revenue dikurangi pengeluaran), Margin (%), Produk terlaris, Hari penjualan terbanyak. Cek setiap hari!', '📊', 70),
  ('sales', 'Buat Voucher Diskon untuk Promo', 'Tab Vouchers → Tambah Voucher. Set kode unik (misal: PROMO10), pilih tipe diskon (% atau Rp), set minimal order dan masa berlaku. Bagikan ke customer via WA untuk boost penjualan!', '🎟️', 68),

  -- Orders
  ('first-order', 'Cara Terima & Konfirmasi Order', 'Order masuk → muncul di tab Orders dengan status "pending". Klik order untuk lihat detail → klik Confirm → sistem otomatis buka WhatsApp ke customer untuk konfirmasi. Balas WA secepat mungkin!', '🛒', 65),
  ('first-order', 'Update Status Order', 'Setelah konfirmasi: pending → confirmed → completed. Kalau customer batalkan: set ke cancelled. Status ini penting untuk laporan penjualan. Hanya "confirmed" dan "completed" yang dihitung sebagai income!', '📦', 62),
  ('first-order', 'Tips: Balas WA Cepat = Lebih Banyak Customer', 'Customer yang dapat balasan WA dalam 5 menit pertama, 80% lebih mungkin jadi pembeli. Kalau sibuk, simpan template balasan seperti: "Halo kak, order sudah kami terima! Kami konfirmasi segera ya 😊"', '⚡', 60),

  -- Inventory
  ('inventory', 'Catat Pengeluaran Bahan Baku', 'Tab Expenses → Tambah Pengeluaran → pilih kategori "Pembelian Bahan". Isi qty dan harga per unit, subtotal otomatis terhitung. Ini penting agar perhitungan profit di dashboard akurat!', '📦', 58),
  ('inventory', 'Set Stok & Pantau Kehabisan', 'Saat tambah produk, isi stok awal. Setiap ada order, stok berkurang otomatis. Kalau stok 0, produk otomatis tidak bisa dipesan. Update stok secara rutin di tab Products → edit produk.', '📊', 55),

  -- Best Practices
  ('best-practices', 'Rutinitas Harian yang Disarankan', 'Pagi: cek Orders baru → konfirmasi via WA → siapkan produk. Siang: update stok yang sudah terjual. Sore: rekap order hari ini. Malam: catat pengeluaran bahan, cek profit harian di Dashboard.', '📅', 50),
  ('best-practices', 'Tingkatkan Penjualan dengan Foto & Deskripsi', 'Produk dengan foto menarik terjual 3x lebih banyak! Tulis deskripsi yang bikin ngiler: "Donat coklat lembut dengan topping meses warna-warni, cocok untuk sarapan keluarga" lebih menarik dari "Donat coklat".', '✨', 45),
  ('best-practices', 'Kelola Ekspektasi Customer', 'Untuk Pesan Khusus, selalu konfirmasi: tanggal siap, desain/rasa, harga final, DP yang dibutuhkan. Lebih baik terlalu detail daripada ada salah paham. Customer happy = repeat order!', '🤝', 40)

on conflict do nothing;
