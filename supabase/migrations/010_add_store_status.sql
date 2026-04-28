-- Add store_status to settings table
-- Tracks whether the store/website is open or closed for orders
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_status TEXT DEFAULT 'open' CHECK (store_status IN ('open', 'closed'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS closed_message TEXT DEFAULT 'Toko sedang tutup. Terima kasih!';
