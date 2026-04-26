-- ============================================================
-- TATARA PROJECT - Complete database setup
-- Paste this entire file into Supabase SQL Editor and click Run
-- Safe to re-run (idempotent)
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null,
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  total numeric(10, 2) not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  updated_at timestamp with time zone default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  qty integer not null,
  price numeric(10, 2) not null,
  created_at timestamp with time zone default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text,
  location_link text,
  qris_image_url text,
  cs_whatsapp_number text,
  special_lead_time_days integer default 3,
  site_logo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add new columns idempotently
alter table settings add column if not exists qris_image_url text;
alter table settings add column if not exists cs_whatsapp_number text;
alter table settings add column if not exists special_lead_time_days integer default 3;
alter table settings add column if not exists site_logo_url text;

alter table products add column if not exists image_url text;
alter table products add column if not exists product_type text not null default 'daily';
alter table products add column if not exists description text;
alter table products add column if not exists flavors jsonb default '[]'::jsonb;
alter table products add column if not exists sizes jsonb default '[]'::jsonb;

alter table orders add column if not exists order_type text not null default 'daily';
alter table orders add column if not exists pickup_date date;
alter table orders add column if not exists pickup_time time;
alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists notes text;
alter table orders add column if not exists discount numeric(10, 2) not null default 0;
alter table orders add column if not exists subtotal numeric(10, 2);
alter table orders add column if not exists voucher_code text;
alter table orders add column if not exists order_number text;

-- Sequence for order numbers (SJB-001, SJB-002, ...)
create sequence if not exists order_number_seq start 1;

create or replace function generate_order_number() returns text
language plpgsql as $$
declare
  v_num integer;
begin
  v_num := nextval('order_number_seq');
  return 'SJB-' || lpad(v_num::text, 3, '0');
end;
$$;

create unique index if not exists idx_orders_order_number on orders(order_number) where order_number is not null;

alter table order_items add column if not exists flavor text;
alter table order_items add column if not exists size text;
alter table order_items add column if not exists notes text;

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_expires_at on orders(expires_at);
create index if not exists idx_orders_order_type on orders(order_type);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);
create index if not exists idx_products_is_active on products(is_active);
create index if not exists idx_products_product_type on products(product_type);

-- Vouchers
create table if not exists vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null default 'amount', -- 'amount' or 'percent'
  discount_value numeric(10, 2) not null,
  min_order numeric(10, 2) not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_vouchers_code on vouchers(code);
create index if not exists idx_vouchers_active on vouchers(is_active);

-- Expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'purchase', -- 'purchase', 'operational', 'other'
  description text not null,
  amount numeric(10, 2) not null,
  expense_date date not null default current_date,
  created_at timestamp with time zone default now()
);

create index if not exists idx_expenses_date on expenses(expense_date);
create index if not exists idx_expenses_category on expenses(category);

-- Landing Content (single row holds editable landing page sections)
create table if not exists landing_content (
  id uuid primary key default gen_random_uuid(),
  hero_title text default 'Celebrate life''s sweet moments with the perfect cake',
  hero_subtitle text default 'Indulge in a symphony of sweetness, where every bite tells a tale of delight.',
  hero_image_url text,
  about_title text default 'About Us',
  about_text text default 'Sinar Jaya Bakery adalah toko kue & roti yang sudah berdiri sejak lama.',
  about_image_1 text,
  about_image_2 text,
  about_image_3 text,
  about_image_4 text,
  cakes_title text default 'Gallery',
  cakes_subtitle text default 'Pilih cake favorit lo',
  order_title text default 'Your Cart',
  contact_title text default 'Visit Us Today',
  contact_text text default 'Mampir ke toko kami untuk merasakan langsung aroma kue. Open daily 7 AM - 8 PM.',
  testimonials jsonb default '[]'::jsonb,
  ingredients jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default now()
);

-- Ensure exactly one row exists
insert into landing_content (id)
select gen_random_uuid()
where not exists (select 1 from landing_content);

-- ============================================================
-- RLS Policies (allow public read for storefront and admin views)
-- ============================================================

alter table products enable row level security;
drop policy if exists "Public read products" on products;
create policy "Public read products" on products for select using (true);

alter table settings enable row level security;
drop policy if exists "Public read settings" on settings;
create policy "Public read settings" on settings for select using (true);

alter table orders enable row level security;
drop policy if exists "Public read orders" on orders;
create policy "Public read orders" on orders for select using (true);

alter table order_items enable row level security;
drop policy if exists "Public read order_items" on order_items;
create policy "Public read order_items" on order_items for select using (true);

alter table vouchers enable row level security;
drop policy if exists "Public read active vouchers" on vouchers;
create policy "Public read active vouchers" on vouchers for select using (is_active = true);

alter table expenses enable row level security;
drop policy if exists "No public read expenses" on expenses;
-- Expenses only readable via service role (no public policy needed)

alter table landing_content enable row level security;
drop policy if exists "Public read landing" on landing_content;
create policy "Public read landing" on landing_content for select using (true);

-- ============================================================
-- 2. RPC: place_order (supports variants, vouchers, order type)
-- ============================================================

drop function if exists place_order(jsonb, text);
drop function if exists place_order(jsonb, text, text, text, text, date, text);
drop function if exists place_order(jsonb, text, text, text, text, date, time, text);

create or replace function place_order(
  p_items jsonb,
  p_customer_name text,
  p_customer_phone text default null,
  p_order_type text default 'daily',
  p_voucher_code text default null,
  p_pickup_date date default null,
  p_pickup_time time default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(10, 2) := 0;
  v_discount numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_flavor text;
  v_size text;
  v_item_notes text;
  v_product_stock integer;
  v_product_price numeric(10, 2);
  v_expires_at timestamp with time zone;
  v_voucher record;
  v_lead_time integer;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Items list cannot be empty';
  end if;

  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'Customer name is required';
  end if;

  -- Validate special order pickup date
  if p_order_type = 'special' then
    select special_lead_time_days into v_lead_time from settings limit 1;
    v_lead_time := coalesce(v_lead_time, 3);
    if p_pickup_date is null then
      raise exception 'Pickup date required for special order';
    end if;
    if p_pickup_date < (current_date + v_lead_time) then
      raise exception 'Special order minimum H-% hari', v_lead_time;
    end if;
  end if;

  -- Compute subtotal & lock stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;

    if v_qty <= 0 then
      raise exception 'Quantity must be positive';
    end if;

    select stock, price into v_product_stock, v_product_price
    from products
    where id = v_product_id and is_active = true
    for update;

    if not found then
      raise exception 'Product % does not exist or is inactive', v_product_id;
    end if;

    if v_product_stock < v_qty then
      raise exception 'Insufficient stock for product %', v_product_id;
    end if;

    v_subtotal := v_subtotal + (v_product_price * v_qty);
  end loop;

  -- Apply voucher
  if p_voucher_code is not null and trim(p_voucher_code) <> '' then
    select * into v_voucher from vouchers
    where code = upper(trim(p_voucher_code))
      and is_active = true
      and (expires_at is null or expires_at > now())
      and (max_uses is null or used_count < max_uses);

    if found then
      if v_subtotal >= v_voucher.min_order then
        if v_voucher.discount_type = 'percent' then
          v_discount := v_subtotal * v_voucher.discount_value / 100;
        else
          v_discount := v_voucher.discount_value;
        end if;
        if v_discount > v_subtotal then
          v_discount := v_subtotal;
        end if;
        update vouchers set used_count = used_count + 1 where id = v_voucher.id;
      end if;
    end if;
  end if;

  v_total := v_subtotal - v_discount;
  v_expires_at := now() + interval '15 minutes';

  insert into orders (
    customer_name, customer_phone, total, subtotal, discount,
    voucher_code, status, expires_at, order_type, pickup_date, pickup_time, notes,
    order_number
  )
  values (
    p_customer_name, p_customer_phone, v_total, v_subtotal, v_discount,
    case when v_discount > 0 then upper(trim(p_voucher_code)) else null end,
    'pending', v_expires_at, coalesce(p_order_type, 'daily'), p_pickup_date, p_pickup_time, p_notes,
    generate_order_number()
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;
    v_flavor := v_item->>'flavor';
    v_size := v_item->>'size';
    v_item_notes := v_item->>'notes';

    select price into v_product_price from products where id = v_product_id;

    update products set stock = stock - v_qty where id = v_product_id;

    insert into order_items (order_id, product_id, qty, price, flavor, size, notes)
    values (v_order_id, v_product_id, v_qty, v_product_price, v_flavor, v_size, v_item_notes);
  end loop;

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', (select order_number from orders where id = v_order_id),
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total', v_total,
    'expires_at', v_expires_at
  );

exception when others then
  return jsonb_build_object(
    'success', false,
    'error', sqlerrm
  );
end;
$$;

-- ============================================================
-- 3. cancel_expired_orders + cron schedule
-- ============================================================

create extension if not exists pg_cron with schema extensions;

drop function if exists cancel_expired_orders();

create or replace function cancel_expired_orders()
returns table(cancelled_count integer)
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_product_id uuid;
  v_qty integer;
  v_cancelled_count integer := 0;
begin
  for v_order_id, v_product_id, v_qty in
    select oi.order_id, oi.product_id, oi.qty
    from order_items oi
    join orders o on o.id = oi.order_id
    where o.status = 'pending' and o.expires_at < now()
  loop
    update products set stock = stock + v_qty where id = v_product_id;
  end loop;

  update orders
  set status = 'cancelled'
  where status = 'pending' and expires_at < now();

  get diagnostics v_cancelled_count = row_count;

  return query select v_cancelled_count;
end;
$$;

select cron.unschedule('cancel-expired-orders')
where exists (select 1 from cron.job where jobname = 'cancel-expired-orders');

select cron.schedule(
  'cancel-expired-orders',
  '*/5 * * * *',
  'select cancel_expired_orders()'
);

-- ============================================================
-- 4. SEED DATA
-- ============================================================

insert into products (name, price, stock, is_active, product_type) values
  ('Croissant', 25000, 50, true, 'daily'),
  ('Donut Cokelat', 15000, 100, true, 'daily'),
  ('Roti Manis', 18000, 75, true, 'daily'),
  ('Roti Tawar', 35000, 30, true, 'daily'),
  ('Pudding', 20000, 60, true, 'daily'),
  ('Brownies', 22000, 80, true, 'daily'),
  ('Bolu Kukus', 25000, 40, true, 'daily'),
  ('Kue Ulang Tahun Custom', 350000, 5, true, 'special'),
  ('Wedding Cake', 1500000, 2, true, 'special'),
  ('Anniversary Cake', 450000, 5, true, 'special')
on conflict do nothing;

insert into settings (whatsapp_number, location_link, special_lead_time_days) values
  ('+6285801299758', 'https://maps.google.com/maps?q=Sinar+Jaya+Bakery', 3)
on conflict do nothing;

-- ============================================================
-- 5. STORAGE BUCKET for product / QRIS images
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bakery-images',
  'bakery-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880;

-- Public read policy
drop policy if exists "Public read bakery images" on storage.objects;
create policy "Public read bakery images"
  on storage.objects for select
  using (bucket_id = 'bakery-images');
