# Tatara Project - Supabase Schema

## Overview

This project contains the Supabase schema and database functions for the Tatara order management system.

## Schema

### Tables

#### products
- `id` (uuid, primary key)
- `name` (text, required)
- `price` (numeric, required)
- `stock` (integer, default 0)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### orders
- `id` (uuid, primary key)
- `customer_name` (text, required)
- `total` (numeric, required)
- `status` (text, default 'pending') - values: pending, cancelled, completed
- `created_at` (timestamp)
- `expires_at` (timestamp, required) - order expires 15 minutes after creation
- `updated_at` (timestamp)

#### order_items
- `id` (uuid, primary key)
- `order_id` (uuid, foreign key → orders.id, cascade delete)
- `product_id` (uuid, foreign key → products.id)
- `qty` (integer, required)
- `price` (numeric, required)
- `created_at` (timestamp)

#### settings
- `id` (uuid, primary key)
- `whatsapp_number` (text)
- `location_link` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## RPC Functions

### place_order(items: jsonb, customer_name: text)

Places a new order atomically. **Must be called from backend - do NOT expose to frontend.**

**Input:**
```json
{
  "items": [
    { "product_id": "uuid-here", "qty": 2 },
    { "product_id": "uuid-here", "qty": 1 }
  ],
  "customer_name": "John Doe"
}
```

**Logic:**
1. Validates products exist and are active
2. Checks stock availability for all items
3. Returns error if any item has insufficient stock
4. If all items available:
   - Creates order with status 'pending' and expires_at = now() + 15 minutes
   - Reduces product stock
   - Inserts order items
5. Returns order_id, total amount, and expiration time

**Returns:**
```json
{
  "success": true,
  "order_id": "uuid",
  "total": 99.99,
  "expires_at": "2026-04-25T18:30:00Z"
}
```

### cancel_expired_orders()

Cancels pending orders that have expired and returns stock to products.

**Logic:**
1. Finds all orders with status='pending' and expires_at < now()
2. Returns stock quantities to products
3. Updates order status to 'cancelled'
4. Returns count of cancelled orders

**Scheduled:** Runs automatically every 5 minutes via pg_cron

## Setup

1. Apply migrations in order (001, 002, 003)
2. Ensure pg_cron extension is enabled
3. Verify scheduled job: `select * from cron.job`

## Security

- `place_order` is defined with `security definer` to prevent direct stock manipulation from frontend
- Order placement must go through backend/RPC only
- Stock changes are atomic - guaranteed consistency
