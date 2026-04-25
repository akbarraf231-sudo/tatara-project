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
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_expires_at on orders(expires_at);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);
create index if not exists idx_products_is_active on products(is_active);

-- ============================================================
-- 2. RPC: place_order
-- ============================================================

drop function if exists place_order(jsonb, text);

create or replace function place_order(
  p_items jsonb,
  p_customer_name text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_order_total numeric(10, 2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_product_stock integer;
  v_product_price numeric(10, 2);
  v_expires_at timestamp with time zone;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Items list cannot be empty';
  end if;

  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'Customer name is required';
  end if;

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

    v_order_total := v_order_total + (v_product_price * v_qty);
  end loop;

  v_expires_at := now() + interval '15 minutes';

  insert into orders (customer_name, total, status, expires_at)
  values (p_customer_name, v_order_total, 'pending', v_expires_at)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;

    select price into v_product_price from products where id = v_product_id;

    update products set stock = stock - v_qty where id = v_product_id;

    insert into order_items (order_id, product_id, qty, price)
    values (v_order_id, v_product_id, v_qty, v_product_price);
  end loop;

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'total', v_order_total,
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
-- 4. SEED DATA (optional - skip if you don't want sample data)
-- ============================================================

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
  ('Inactive Item', 25000, 50, false)
on conflict do nothing;

insert into settings (whatsapp_number, location_link) values
  ('+6281234567890', 'https://maps.google.com/?q=-6.2,106.8')
on conflict do nothing;
