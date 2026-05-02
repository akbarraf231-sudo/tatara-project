-- ============================================================
-- 011: Per-flavor variant stock with anti-overselling
-- ============================================================
-- Each flavor (variant) has its own stock counter.
-- - If a product has flavors registered → stock comes from per-flavor row.
-- - If a product has NO flavors → fallback to product.stock as before.
-- Uses SELECT FOR UPDATE to lock rows during checkout (prevents oversell).
-- ============================================================

-- 1) Storage table for per-flavor stock
CREATE TABLE IF NOT EXISTS product_flavor_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  flavor TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, flavor)
);

CREATE INDEX IF NOT EXISTS idx_pfs_product_id ON product_flavor_stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_pfs_active ON product_flavor_stocks(product_id, is_active) WHERE is_active = true;

-- 2) Helper: aggregate flavor stock per product (sum of all variant stocks)
CREATE OR REPLACE FUNCTION get_product_total_stock(p_product_id UUID)
RETURNS INTEGER LANGUAGE SQL STABLE AS $$
  SELECT COALESCE(SUM(stock), 0)::INTEGER
  FROM product_flavor_stocks
  WHERE product_id = p_product_id AND is_active = true;
$$;

-- 3) Backfill: for products that already have `flavors` set,
--    create a row per flavor with stock = 0 (admin will fill in).
--    Skip if a row already exists.
DO $$
DECLARE
  r RECORD;
  f TEXT;
BEGIN
  FOR r IN SELECT id, flavors FROM products WHERE flavors IS NOT NULL LOOP
    IF jsonb_typeof(to_jsonb(r.flavors)) = 'array' THEN
      FOR f IN SELECT jsonb_array_elements_text(to_jsonb(r.flavors)) LOOP
        INSERT INTO product_flavor_stocks (product_id, flavor, stock)
        VALUES (r.id, f, 0)
        ON CONFLICT (product_id, flavor) DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- 4) Updated place_order RPC with per-variant stock + FOR UPDATE locking
DROP FUNCTION IF EXISTS place_order(jsonb, text);
DROP FUNCTION IF EXISTS place_order(jsonb, text, text, text, text, date, text);
DROP FUNCTION IF EXISTS place_order(jsonb, text, text, text, text, date, time, text);

CREATE OR REPLACE FUNCTION place_order(
  p_items JSONB,
  p_customer_name TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_order_type TEXT DEFAULT 'daily',
  p_voucher_code TEXT DEFAULT NULL,
  p_pickup_date DATE DEFAULT NULL,
  p_pickup_time TIME DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_subtotal NUMERIC(10, 2) := 0;
  v_discount NUMERIC(10, 2) := 0;
  v_total NUMERIC(10, 2) := 0;
  v_item JSONB;
  v_product_id UUID;
  v_qty INTEGER;
  v_flavor TEXT;
  v_size TEXT;
  v_item_notes TEXT;
  v_product_name TEXT;
  v_product_stock INTEGER;
  v_product_price NUMERIC(10, 2);
  v_has_flavors BOOLEAN;
  v_variant_stock INTEGER;
  v_flavor_part TEXT;
  v_flavor_list TEXT[];
  v_expires_at TIMESTAMPTZ;
  v_voucher RECORD;
  v_lead_time INTEGER;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Items list cannot be empty';
  END IF;

  IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF p_order_type = 'special' THEN
    SELECT special_lead_time_days INTO v_lead_time FROM settings LIMIT 1;
    v_lead_time := COALESCE(v_lead_time, 3);
    IF p_pickup_date IS NULL THEN
      RAISE EXCEPTION 'Pickup date required for special order';
    END IF;
    IF p_pickup_date < (CURRENT_DATE + v_lead_time) THEN
      RAISE EXCEPTION 'Special order minimum H-% hari', v_lead_time;
    END IF;
  END IF;

  -- Validate + lock stock (FOR UPDATE ⇒ no oversell race)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'qty')::INTEGER;
    v_flavor := v_item->>'flavor';

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantity must be positive';
    END IF;

    -- Lock product row first
    SELECT name, stock, price INTO v_product_name, v_product_stock, v_product_price
    FROM products
    WHERE id = v_product_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk tidak ditemukan atau nonaktif';
    END IF;

    -- Has any active flavor variant?
    SELECT EXISTS (
      SELECT 1 FROM product_flavor_stocks
      WHERE product_id = v_product_id AND is_active = true
    ) INTO v_has_flavors;

    IF v_has_flavors THEN
      -- Variant-based stock. Customer's flavor field may be a single name
      -- or comma-separated list (e.g. "Cokelat, Vanilla") for multi-flavor boxes.
      IF v_flavor IS NULL OR trim(v_flavor) = '' THEN
        RAISE EXCEPTION 'Pilih varian rasa untuk produk %', v_product_name;
      END IF;

      v_flavor_list := string_to_array(v_flavor, ', ');

      FOREACH v_flavor_part IN ARRAY v_flavor_list
      LOOP
        v_flavor_part := trim(v_flavor_part);
        IF v_flavor_part = '' THEN CONTINUE; END IF;

        -- Lock the variant row
        SELECT stock INTO v_variant_stock
        FROM product_flavor_stocks
        WHERE product_id = v_product_id
          AND flavor = v_flavor_part
          AND is_active = true
        FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Varian rasa "%" tidak tersedia untuk %', v_flavor_part, v_product_name;
        END IF;

        IF v_variant_stock < v_qty THEN
          RAISE EXCEPTION 'Stok varian "%" habis (% tersedia, butuh %)',
            v_flavor_part, v_variant_stock, v_qty;
        END IF;
      END LOOP;
    ELSE
      -- No flavor variants → fall back to product-level stock
      IF v_product_stock < v_qty THEN
        RAISE EXCEPTION 'Stok % habis (% tersedia, butuh %)',
          v_product_name, v_product_stock, v_qty;
      END IF;
    END IF;

    v_subtotal := v_subtotal + (v_product_price * v_qty);
  END LOOP;

  -- Voucher
  IF p_voucher_code IS NOT NULL AND trim(p_voucher_code) <> '' THEN
    SELECT * INTO v_voucher FROM vouchers
    WHERE code = upper(trim(p_voucher_code))
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (max_uses IS NULL OR used_count < max_uses);

    IF FOUND THEN
      IF v_subtotal >= v_voucher.min_order THEN
        IF v_voucher.discount_type = 'percent' THEN
          v_discount := v_subtotal * v_voucher.discount_value / 100;
        ELSE
          v_discount := v_voucher.discount_value;
        END IF;
        IF v_discount > v_subtotal THEN
          v_discount := v_subtotal;
        END IF;
        UPDATE vouchers SET used_count = used_count + 1 WHERE id = v_voucher.id;
      END IF;
    END IF;
  END IF;

  v_total := v_subtotal - v_discount;
  v_expires_at := NOW() + INTERVAL '15 minutes';

  INSERT INTO orders (
    customer_name, customer_phone, total, subtotal, discount,
    voucher_code, status, expires_at, order_type, pickup_date, pickup_time, notes,
    order_number
  )
  VALUES (
    p_customer_name, p_customer_phone, v_total, v_subtotal, v_discount,
    CASE WHEN v_discount > 0 THEN upper(trim(p_voucher_code)) ELSE NULL END,
    'pending', v_expires_at, COALESCE(p_order_type, 'daily'), p_pickup_date, p_pickup_time, p_notes,
    generate_order_number()
  )
  RETURNING id INTO v_order_id;

  -- Deduct stock + insert order_items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'qty')::INTEGER;
    v_flavor := v_item->>'flavor';
    v_size := v_item->>'size';
    v_item_notes := v_item->>'notes';

    SELECT price INTO v_product_price FROM products WHERE id = v_product_id;

    SELECT EXISTS (
      SELECT 1 FROM product_flavor_stocks
      WHERE product_id = v_product_id AND is_active = true
    ) INTO v_has_flavors;

    IF v_has_flavors AND v_flavor IS NOT NULL THEN
      v_flavor_list := string_to_array(v_flavor, ', ');
      FOREACH v_flavor_part IN ARRAY v_flavor_list
      LOOP
        v_flavor_part := trim(v_flavor_part);
        IF v_flavor_part = '' THEN CONTINUE; END IF;
        UPDATE product_flavor_stocks
        SET stock = stock - v_qty, updated_at = NOW()
        WHERE product_id = v_product_id AND flavor = v_flavor_part;
      END LOOP;
    ELSE
      UPDATE products SET stock = stock - v_qty WHERE id = v_product_id;
    END IF;

    INSERT INTO order_items (order_id, product_id, qty, price, flavor, size, notes)
    VALUES (v_order_id, v_product_id, v_qty, v_product_price, v_flavor, v_size, v_item_notes);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', (SELECT order_number FROM orders WHERE id = v_order_id),
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total', v_total,
    'expires_at', v_expires_at
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 5) Updated cancel_expired_orders to refund per-variant stock too
DROP FUNCTION IF EXISTS cancel_expired_orders();

CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS TABLE(cancelled_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  v_flavor_part TEXT;
  v_flavor_list TEXT[];
  v_has_flavors BOOLEAN;
  v_cancelled_count INTEGER := 0;
BEGIN
  FOR r IN
    SELECT oi.order_id, oi.product_id, oi.qty, oi.flavor
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'pending' AND o.expires_at < NOW()
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM product_flavor_stocks
      WHERE product_id = r.product_id AND is_active = true
    ) INTO v_has_flavors;

    IF v_has_flavors AND r.flavor IS NOT NULL AND r.flavor <> '' THEN
      v_flavor_list := string_to_array(r.flavor, ', ');
      FOREACH v_flavor_part IN ARRAY v_flavor_list
      LOOP
        v_flavor_part := trim(v_flavor_part);
        IF v_flavor_part = '' THEN CONTINUE; END IF;
        UPDATE product_flavor_stocks
        SET stock = stock + r.qty, updated_at = NOW()
        WHERE product_id = r.product_id AND flavor = v_flavor_part;
      END LOOP;
    ELSE
      UPDATE products SET stock = stock + r.qty WHERE id = r.product_id;
    END IF;
  END LOOP;

  UPDATE orders
  SET status = 'cancelled'
  WHERE status = 'pending' AND expires_at < NOW();

  GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;
  RETURN QUERY SELECT v_cancelled_count;
END;
$$;

-- 6) Helper: replace flavor stocks for a product in one shot
--    (simplifies admin UPDATEs).
DROP FUNCTION IF EXISTS upsert_product_flavor_stocks(UUID, JSONB);

CREATE OR REPLACE FUNCTION upsert_product_flavor_stocks(
  p_product_id UUID,
  p_flavors JSONB  -- [{"flavor":"Cokelat","stock":10}, ...]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_flavor TEXT;
  v_stock INTEGER;
  v_keep TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF p_flavors IS NULL THEN
    RETURN;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_flavors)
  LOOP
    v_flavor := trim(v_item->>'flavor');
    v_stock := COALESCE((v_item->>'stock')::INTEGER, 0);
    IF v_flavor IS NULL OR v_flavor = '' THEN CONTINUE; END IF;
    IF v_stock < 0 THEN v_stock := 0; END IF;

    INSERT INTO product_flavor_stocks (product_id, flavor, stock, is_active)
    VALUES (p_product_id, v_flavor, v_stock, true)
    ON CONFLICT (product_id, flavor)
    DO UPDATE SET stock = EXCLUDED.stock, is_active = true, updated_at = NOW();

    v_keep := array_append(v_keep, v_flavor);
  END LOOP;

  -- Soft-delete flavors no longer in the list (keeps history-safe)
  UPDATE product_flavor_stocks
  SET is_active = false, updated_at = NOW()
  WHERE product_id = p_product_id
    AND NOT (flavor = ANY(v_keep));
END;
$$;
