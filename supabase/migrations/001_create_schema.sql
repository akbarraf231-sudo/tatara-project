-- Create products table
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null,
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  total numeric(10, 2) not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  updated_at timestamp with time zone default now()
);

-- Create order_items table
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  qty integer not null,
  price numeric(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Create settings table
create table settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text,
  location_link text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index idx_orders_status on orders(status);
create index idx_orders_expires_at on orders(expires_at);
create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);
create index idx_products_is_active on products(is_active);
