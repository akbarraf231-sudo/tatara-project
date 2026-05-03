-- ============================================================
-- 012: Size variants now carry "units" (isi per box)
-- ============================================================
-- products.sizes JSON shape becomes:
--   [{ "name": "Satuan", "price": 0,    "units": 1 },
--    { "name": "Isi 3",  "price": 5000, "units": 3 },
--    { "name": "Isi 6",  "price": 9000, "units": 6 }]
--
-- Stock math:
--   total units consumed by 1 cart item = qty * units(of chosen size)
--   For multi-flavor box (e.g. "Cokelat, Vanilla" + Isi 6):
--     units are distributed evenly across selected flavors;
--     remainder donuts go to the first flavors.
--     Isi 6 with 2 flavors → 3 + 3
--     Isi 7 with 2 flavors → 4 + 3
--     Isi 6 with 3 flavors → 2 + 2 + 2
--
-- Backward compatible: missing "units" → defaults to 1 (current behavior).
-- ============================================================

-- 1) Updated place_order RPC
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
  v_num_flavors INTEGER;
  v_size_units INTEGER;
  v_total_units INTEGER;
  v_base_per INTEGER;
  v_remainder INTEGER;
  v_per_flavor INTEGER;
  v_idx INTEGER;
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

  -- VALIDATE + LOCK
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'qty')::INTEGER;
    v_flavor := v_item->>'flavor';
    v_size := v_item->>'size';

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantity must be positive';
    END IF;

    -- Lock product
    SELECT name, stock, price INTO v_product_name, v_product_stock, v_product_price
    FROM products
    WHERE id = v_product_id AND is_active = true
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk tidak ditemukan atau nonaktif';
    END IF;

    -- Resolve size units (default 1)
    v_size_units := 1;
    IF v_size IS NOT NULL AND v_size <> '' THEN
      SELECT COALESCE((s->>'units')::INTEGER, 1) INTO v_size_units
      FROM products p, jsonb_array_elements(p.sizes) s
      WHERE p.id = v_product_id AND s->>'name' = v_size
      LIMIT 1;
      v_size_units := COALESCE(v_size_units, 1);
      IF v_size_units < 1 THEN v_size_units := 1; END IF;
    END IF;

    v_total_units := v_qty * v_size_units;

    -- Has any active flavor variant?
    SELECT EXISTS (
      SELECT 1 FROM product_flavor_stocks
      WHERE product_id = v_product_id AND is_active = true
    ) INTO v_has_flavors;

    IF v_has_flavors THEN
      IF v_flavor IS NULL OR trim(v_flavor) = '' THEN
        RAISE EXCEPTION 'Pilih varian rasa untuk produk %', v_product_name;
      END IF;

      v_flavor_list := string_to_array(v_flavor, ', ');
      -- Trim every element and drop blanks
      v_flavor_list := ARRAY(
        SELECT trim(x) FROM unnest(v_flavor_list) AS x WHERE trim(x) <> ''
      );
      v_num_flavors := array_length(v_flavor_list, 1);

      IF v_num_flavors IS NULL OR v_num_flavors = 0 THEN
        RAISE EXCEPTION 'Pilih varian rasa untuk produk %', v_product_name;
      END IF;

      v_base_per  := v_total_units / v_num_flavors;
      v_remainder := v_total_units - (v_base_per * v_num_flavors);

      FOR v_idx IN 1..v_num_flavors LOOP
        v_flavor_part := v_flavor_list[v_idx];
        v_per_flavor := v_base_per + CASE WHEN v_idx <= v_remainder THEN 1 ELSE 0 END;

        SELECT stock INTO v_variant_stock
        FROM product_flavor_stocks
        WHERE product_id = v_product_id
          AND flavor = v_flavor_part
          AND is_active = true
        FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Varian rasa "%" tidak tersedia untuk %', v_flavor_part, v_product_name;
        END IF;
        IF v_variant_stock < v_per_flavor THEN
          RAISE EXCEPTION 'Stok rasa "%" tinggal % (butuh %)', v_flavor_part, v_variant_stock, v_per_flavor;
        END IF;
      END LOOP;
    ELSE
      IF v_product_stock < v_total_units THEN
        RAISE EXCEPTION 'Stok % tinggal % (butuh %)', v_product_name, v_product_stock, v_total_units;
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
        IF v_discount > v_subtotal THEN v_discount := v_subtotal; END IF;
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

  -- DEDUCT STOCK + INSERT order_items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'qty')::INTEGER;
    v_flavor := v_item->>'flavor';
    v_size := v_item->>'size';
    v_item_notes := v_item->>'notes';

    SELECT price INTO v_product_price FROM products WHERE id = v_product_id;

    v_size_units := 1;
    IF v_size IS NOT NULL AND v_size <> '' THEN
      SELECT COALESCE((s->>'units')::INTEGER, 1) INTO v_size_units
      FROM products p, jsonb_array_elements(p.sizes) s
      WHERE p.id = v_product_id AND s->>'name' = v_size
      LIMIT 1;
      v_size_units := COALESCE(v_size_units, 1);
      IF v_size_units < 1 THEN v_size_units := 1; END IF;
    END IF;

    v_total_units := v_qty * v_size_units;

    SELECT EXISTS (
      SELECT 1 FROM product_flavor_stocks
      WHERE product_id = v_product_id AND is_active = true
    ) INTO v_has_flavors;

    IF v_has_flavors AND v_flavor IS NOT NULL THEN
      v_flavor_list := string_to_array(v_flavor, ', ');
      v_flavor_list := ARRAY(SELECT trim(x) FROM unnest(v_flavor_list) AS x WHERE trim(x) <> '');
      v_num_flavors := array_length(v_flavor_list, 1);
      v_base_per := v_total_units / v_num_flavors;
      v_remainder := v_total_units - (v_base_per * v_num_flavors);

      FOR v_idx IN 1..v_num_flavors LOOP
        v_per_flavor := v_base_per + CASE WHEN v_idx <= v_remainder THEN 1 ELSE 0 END;
        UPDATE product_flavor_stocks
        SET stock = stock - v_per_flavor, updated_at = NOW()
        WHERE product_id = v_product_id AND flavor = v_flavor_list[v_idx];
      END LOOP;
    ELSE
      UPDATE products SET stock = stock - v_total_units WHERE id = v_product_id;
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
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2) cancel_expired_orders refunds with the same units math
DROP FUNCTION IF EXISTS cancel_expired_orders();

CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS TABLE(cancelled_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  v_size_units INTEGER;
  v_total_units INTEGER;
  v_has_flavors BOOLEAN;
  v_flavor_list TEXT[];
  v_num_flavors INTEGER;
  v_base_per INTEGER;
  v_remainder INTEGER;
  v_per_flavor INTEGER;
  v_idx INTEGER;
  v_cancelled_count INTEGER := 0;
BEGIN
  FOR r IN
    SELECT oi.product_id, oi.qty, oi.flavor, oi.size
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'pending' AND o.expires_at < NOW()
  LOOP
    v_size_units := 1;
    IF r.size IS NOT NULL AND r.size <> '' THEN
      SELECT COALESCE((s->>'units')::INTEGER, 1) INTO v_size_units
      FROM products p, jsonb_array_elements(p.sizes) s
      WHERE p.id = r.product_id AND s->>'name' = r.size
      LIMIT 1;
      v_size_units := COALESCE(v_size_units, 1);
      IF v_size_units < 1 THEN v_size_units := 1; END IF;
    END IF;
    v_total_units := r.qty * v_size_units;

    SELECT EXISTS (
      SELECT 1 FROM product_flavor_stocks
      WHERE product_id = r.product_id AND is_active = true
    ) INTO v_has_flavors;

    IF v_has_flavors AND r.flavor IS NOT NULL AND r.flavor <> '' THEN
      v_flavor_list := string_to_array(r.flavor, ', ');
      v_flavor_list := ARRAY(SELECT trim(x) FROM unnest(v_flavor_list) AS x WHERE trim(x) <> '');
      v_num_flavors := array_length(v_flavor_list, 1);
      IF v_num_flavors IS NULL OR v_num_flavors = 0 THEN CONTINUE; END IF;
      v_base_per := v_total_units / v_num_flavors;
      v_remainder := v_total_units - (v_base_per * v_num_flavors);
      FOR v_idx IN 1..v_num_flavors LOOP
        v_per_flavor := v_base_per + CASE WHEN v_idx <= v_remainder THEN 1 ELSE 0 END;
        UPDATE product_flavor_stocks
        SET stock = stock + v_per_flavor, updated_at = NOW()
        WHERE product_id = r.product_id AND flavor = v_flavor_list[v_idx];
      END LOOP;
    ELSE
      UPDATE products SET stock = stock + v_total_units WHERE id = r.product_id;
    END IF;
  END LOOP;

  UPDATE orders
  SET status = 'cancelled'
  WHERE status = 'pending' AND expires_at < NOW();

  GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;
  RETURN QUERY SELECT v_cancelled_count;
END;
$$;
