-- Enable pg_cron extension
create extension if not exists pg_cron with schema extensions;

-- Function to cancel expired orders and return stock
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
  -- Find all pending orders that have expired
  for v_order_id, v_product_id, v_qty in
    select
      oi.order_id,
      oi.product_id,
      oi.qty
    from order_items oi
    join orders o on o.id = oi.order_id
    where o.status = 'pending'
      and o.expires_at < now()
  loop
    -- Return stock to products
    update products
    set stock = stock + v_qty
    where id = v_product_id;
  end loop;

  -- Update all pending expired orders to cancelled
  update orders
  set status = 'cancelled'
  where status = 'pending'
    and expires_at < now();

  get diagnostics v_cancelled_count = row_count;

  return query select v_cancelled_count;
end;
$$;

-- Unschedule existing job if present, then schedule fresh
select cron.unschedule('cancel-expired-orders')
where exists (select 1 from cron.job where jobname = 'cancel-expired-orders');

select cron.schedule(
  'cancel-expired-orders',
  '*/5 * * * *',
  'select cancel_expired_orders()'
);
