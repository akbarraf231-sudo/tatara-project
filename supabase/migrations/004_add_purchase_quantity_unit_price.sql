-- Add quantity and unit_price columns to expenses table for purchase line items
-- subtotal (= quantity * unit_price) is stored in the existing `amount` column
-- and is computed/stamped server-side on insert.

alter table expenses add column if not exists quantity numeric(10, 2);
alter table expenses add column if not exists unit_price numeric(10, 2);
