-- Add badge column to products for custom labels (Terlaris, Baru, dll)
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;

-- Example badges: 'Terlaris', 'Baru', 'Promo', etc.
-- Leave empty (NULL) if no badge needed
