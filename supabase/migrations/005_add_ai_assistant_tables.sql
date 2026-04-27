-- Add new columns untuk inventory management
alter table products add column if not exists restock_threshold numeric(10, 2) default 10;
alter table products add column if not exists unit_of_measurement text default 'pcs'; -- 'kg', 'liter', 'pcs', 'box', etc

-- Owner tips table untuk onboarding
create table if not exists owner_tips (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- 'getting-started', 'inventory', 'sales', 'customers', 'best-practices'
  title text not null,
  description text not null,
  video_url text,
  icon text default '💡', -- emoji icon
  priority integer default 0, -- higher = show first
  created_at timestamp with time zone default now()
);

-- Owner checklist untuk onboarding progress
create table if not exists owner_checklist (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text default 'setup', -- 'setup', 'first-product', 'first-order', etc
  video_url text,
  priority integer default 0,
  created_at timestamp with time zone default now()
);

-- Track progress per owner
create table if not exists owner_checklist_progress (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null, -- admin user ID
  checklist_id uuid not null references owner_checklist(id) on delete cascade,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(owner_id, checklist_id)
);

-- Seed initial tips
insert into owner_tips (category, title, description, icon, priority) values
  ('getting-started', 'Apa itu Sinar Jaya Admin?', 'Sistem untuk manage produk, order, penjualan, dan inventory bakery Anda', '👋', 100),
  ('getting-started', 'Daily vs Special Order', 'Daily: produk tersedia hari ini, bisa order pagi pickup sore. Special: pre-order, butuh H-3 atau lebih', '☀️', 90),
  ('inventory', 'Set Restock Threshold', 'Tentukan jumlah minimum stok per produk. Saat stok kurang, sistem kasih alert otomatis', '📊', 80),
  ('inventory', 'Manage Inventory', 'Update stok saat ada penjualan atau pembelian bahan baku. Pantau stok di dashboard', '📦', 70),
  ('sales', 'Lihat Penjualan', 'Dashboard menampilkan order terbaru, revenue, profit. Gunakan untuk analisis dan planning', '💰', 60),
  ('sales', 'Print Order List', 'Cetak list order harian untuk panduan produksi dan packing', '🖨️', 50),
  ('best-practices', 'Tips: Pricing', 'Hitung cost (bahan + tenaga), tambah 40-60% untuk profit. Atur harga kompetitif', '💡', 40)
on conflict do nothing;

insert into owner_checklist (title, description, category, priority) values
  ('Setup WhatsApp Number', 'Masukkan nomor WhatsApp admin untuk terima order dari customer', 'setup', 100),
  ('Upload Logo Toko', 'Upload logo toko Anda. Akan muncul di navbar dan splash screen', 'setup', 90),
  ('Set Location Link', 'Tambah Google Maps link lokasi toko, kasihan ke tombol "View Location"', 'setup', 80),
  ('Upload Produk Pertama', 'Tambah 1-2 produk populer Anda ke Daily atau Special Order', 'first-product', 70),
  ('Set Harga Produk', 'Tentukan harga yang kompetitif dan profitable', 'first-product', 60),
  ('Terima Order Pertama', 'Tunggu customer order, lihat di Orders, confirm via WhatsApp', 'first-order', 50),
  ('Update Stock', 'Setelah kirim, update stock. Pantau inventory agar jangan sampai kehabisan', 'first-order', 40)
on conflict do nothing;
