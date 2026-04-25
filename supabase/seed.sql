-- Seed data for testing
-- Run after migrations are applied

-- Sample products
insert into products (name, price, stock, is_active) values
  ('Croissant', 25000, 50, true),
  ('Donut Cokelat', 15000, 100, true),
  ('Roti Manis', 18000, 75, true),
  ('Kue Ulang Tahun', 150000, 10, true),
  ('Roti Tawar', 35000, 30, true),
  ('Pudding', 20000, 60, true),
  ('Brownies', 22000, 80, true),
  ('Bolu Kukus', 25000, 40, true);

-- Initial settings
insert into settings (whatsapp_number, location_link) values
  ('+6285801299758', 'https://maps.google.com/maps?q=Sinar+Jaya+Bakery');
