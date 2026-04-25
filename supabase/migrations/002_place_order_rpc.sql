-- Place Order RPC Function
-- This function handles creating orders and order items atomically
-- It also handles stock deduction
CREATE OR REPLACE FUNCTION place_order(
  p_items JSONB,
  p_customer_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_order_id BIGINT;
  v_total DECIMAL(10, 2) := 0;
  v_item JSONB;
  v_product_id BIGINT;
  v_qty INTEGER;
  v_product_stock INTEGER;
  v_product_price DECIMAL(10, 2);
BEGIN
  -- Validate customer name
  IF p_customer_name IS NULL OR p_customer_name = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Customer name is required');
  END IF;

  -- Validate items
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Items are required');
  END IF;

  -- Check stock and calculate total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::BIGINT;
    v_qty := (v_item->>'qty')::INTEGER;

    -- Get product info
    SELECT stock, price INTO v_product_stock, v_product_price
    FROM products
    WHERE id = v_product_id AND is_active = true;

    IF v_product_stock IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Product not found or inactive');
    END IF;

    IF v_product_stock < v_qty THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock for product');
    END IF;

    v_total := v_total + (v_product_price * v_qty);
  END LOOP;

  -- Create order
  INSERT INTO orders (customer_name, total, status)
  VALUES (p_customer_name, v_total, 'pending')
  RETURNING id INTO v_order_id;

  -- Insert order items and deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::BIGINT;
    v_qty := (v_item->>'qty')::INTEGER;

    -- Get product price
    SELECT price INTO v_product_price
    FROM products
    WHERE id = v_product_id;

    -- Insert order item
    INSERT INTO order_items (order_id, product_id, qty, price)
    VALUES (v_order_id, v_product_id, v_qty, v_product_price);

    -- Deduct stock
    UPDATE products
    SET stock = stock - v_qty
    WHERE id = v_product_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'total', v_total,
    'customer_name', p_customer_name
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Auto-cancel pending orders after 15 minutes
-- This function can be called periodically via a cron job
CREATE OR REPLACE FUNCTION auto_cancel_expired_orders()
RETURNS void AS $$
BEGIN
  UPDATE orders
  SET status = 'cancelled'
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '15 minutes';
END;
$$ LANGUAGE plpgsql;
