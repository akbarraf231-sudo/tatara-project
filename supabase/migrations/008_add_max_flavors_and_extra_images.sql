-- Add max_flavors_selectable column to control how many flavors customer can select
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_flavors_selectable INTEGER DEFAULT 1;

-- Add extra image columns for Shopee-style 3-image carousel
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_2 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_3 TEXT;
