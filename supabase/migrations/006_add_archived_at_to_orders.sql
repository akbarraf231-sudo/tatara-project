-- Add archived_at column untuk order archiving
alter table orders add column if not exists archived_at timestamp with time zone default null;

-- Create index untuk filter orders yang tidak archived
create index if not exists idx_orders_archived_at on orders(archived_at);
create index if not exists idx_orders_active on orders(archived_at) where archived_at is null;
