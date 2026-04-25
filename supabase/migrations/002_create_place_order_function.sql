-- RPC function to place an order atomically
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
  -- Validate input
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Items list cannot be empty';
  end if;

  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'Customer name is required';
  end if;

  -- Start transaction (implicit in plpgsql)
  -- Validate products exist and check stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;

    -- Validate qty
    if v_qty <= 0 then
      raise exception 'Quantity must be positive';
    end if;

    -- Get product and check stock
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

    -- Calculate total
    v_order_total := v_order_total + (v_product_price * v_qty);
  end loop;

  -- Set expiration time to 15 minutes from now
  v_expires_at := now() + interval '15 minutes';

  -- Create order
  insert into orders (customer_name, total, status, expires_at)
  values (p_customer_name, v_order_total, 'pending', v_expires_at)
  returning id into v_order_id;

  -- Process each item: reduce stock and insert order_items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;

    -- Get current product price
    select price into v_product_price
    from products
    where id = v_product_id;

    -- Reduce stock
    update products
    set stock = stock - v_qty
    where id = v_product_id;

    -- Insert order item
    insert into order_items (order_id, product_id, qty, price)
    values (v_order_id, v_product_id, v_qty, v_product_price);
  end loop;

  -- Return success response
  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'total', v_order_total,
    'expires_at', v_expires_at
  );

exception when others then
  -- Rollback happens automatically
  return jsonb_build_object(
    'success', false,
    'error', sqlerrm
  );
end;
$$;
