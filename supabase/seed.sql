-- Seed data for testing
-- Run after migrations are applied

-- Sample products
insert into products (name, price, stock, is_active) values
  ('Espresso', 25000, 50, true),
  ('Cappuccino', 35000, 30, true),
  ('Latte', 38000, 30, true),
  ('Americano', 28000, 40, true),
  ('Mocha', 42000, 25, true),
  ('Croissant', 22000, 20, true),
  ('Chocolate Cake', 45000, 15, true),
  ('Tiramisu', 50000, 10, true),
  ('Iced Tea', 18000, 100, true),
  ('Out of Stock Item', 30000, 0, true),
  ('Inactive Item', 25000, 50, false);

-- Initial settings
insert into settings (whatsapp_number, location_link) values
  ('+6281234567890', 'https://maps.google.com/?q=-6.2,106.8');
