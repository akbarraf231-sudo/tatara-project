-- Sample Products
-- Run this file to populate test data
-- You can modify the data before running

INSERT INTO products (name, price, stock, is_active) VALUES
  ('Croissant', 25000, 50, true),
  ('Donut Cokelat', 15000, 100, true),
  ('Roti Manis', 18000, 75, true),
  ('Kue Ulang Tahun', 150000, 10, true),
  ('Roti Tawar', 35000, 30, true),
  ('Pudding', 20000, 60, true),
  ('Brownies', 22000, 80, true),
  ('Bolu Kukus', 25000, 40, true)
ON CONFLICT DO NOTHING;

-- Sample Settings
INSERT INTO settings (whatsapp_number, location_link) VALUES
  ('+6285801299758', 'https://maps.google.com/maps?q=Sinar+Jaya+Bakery')
ON CONFLICT DO NOTHING;
