delete from owner_tips;

insert into owner_tips (category, title, description, icon, priority) values
('getting-started', 'Selamat Datang!', 'Mulai dari Settings dulu: isi nomor WhatsApp, upload logo, dan pasang QRIS. Setelah itu baru tambah produk.', '👋', 100),
('getting-started', 'Harian vs Pesan Khusus', 'Harian: siap hari ini, pesan pagi ambil sore. Pesan Khusus: butuh pre-order minimal H-3, cocok untuk kue ulang tahun.', '☀️', 95),
('first-product', 'Tambah Produk Pertama', 'Products → Tambah Produk → isi nama, harga, stok → upload foto → Save. Foto yang bagus = lebih laku!', '🎂', 90),
('sales', 'Cara Hitung Harga', 'Hitung biaya bahan + operasional, lalu tambah margin 40-60%. Contoh: biaya Rp 8.000 → jual Rp 12.000-13.000.', '💰', 85),
('first-order', 'Terima & Konfirmasi Order', 'Order masuk → buka tab Orders → klik Confirm → WA customer otomatis terbuka. Balas secepat mungkin!', '🛒', 80),
('inventory', 'Catat Pengeluaran', 'Tab Expenses → Tambah Pengeluaran tiap beli bahan. Ini penting agar profit di dashboard akurat.', '📦', 75),
('best-practices', 'Rutinitas Harian', 'Pagi: cek order baru & konfirmasi WA. Siang: update stok. Malam: catat pengeluaran & cek profit.', '📅', 70);
