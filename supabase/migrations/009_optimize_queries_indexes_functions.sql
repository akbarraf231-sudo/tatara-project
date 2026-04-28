-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_archived_at ON orders(archived_at);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_orders ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);

-- Simple function to get insights data
CREATE OR REPLACE FUNCTION get_insights_data(
  limit_val INT DEFAULT 1000,
  offset_val INT DEFAULT 0
)
RETURNS TABLE (
  total_revenue NUMERIC,
  today_revenue NUMERIC,
  month_revenue NUMERIC,
  daily_revenue NUMERIC,
  special_revenue NUMERIC,
  total_expenses NUMERIC,
  total_profit NUMERIC,
  profit_margin NUMERIC,
  top_products JSONB,
  total_count BIGINT
) LANGUAGE SQL STABLE AS $$
WITH confirmed_orders AS (
  SELECT id, total, created_at, order_type
  FROM orders
  WHERE status IN ('confirmed', 'completed') AND archived_at IS NULL
),
revenue_data AS (
  SELECT
    COALESCE(SUM(total), 0)::NUMERIC as total_rev,
    COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total ELSE 0 END), 0)::NUMERIC as today_rev,
    COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_TRUNC('month', CURRENT_TIMESTAMP)::DATE THEN total ELSE 0 END), 0)::NUMERIC as month_rev,
    COALESCE(SUM(CASE WHEN order_type != 'special' THEN total ELSE 0 END), 0)::NUMERIC as daily_rev,
    COALESCE(SUM(CASE WHEN order_type = 'special' THEN total ELSE 0 END), 0)::NUMERIC as special_rev
  FROM confirmed_orders
),
expenses_data AS (
  SELECT COALESCE(SUM(amount), 0)::NUMERIC as total_exp FROM expenses
),
top_products_data AS (
  SELECT
    JSON_AGG(
      JSON_BUILD_OBJECT('name', name, 'qty', qty, 'revenue', revenue)
      ORDER BY revenue DESC
    ) as products
  FROM (
    SELECT
      p.name,
      SUM(oi.qty) as qty,
      SUM(oi.price * oi.qty) as revenue
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 10
  ) t
)
SELECT
  rd.total_rev,
  rd.today_rev,
  rd.month_rev,
  rd.daily_rev,
  rd.special_rev,
  ed.total_exp,
  (rd.total_rev - ed.total_exp),
  CASE WHEN rd.total_rev > 0 THEN ROUND(((rd.total_rev - ed.total_exp) / rd.total_rev * 100), 1)::NUMERIC ELSE 0::NUMERIC END,
  COALESCE(tpd.products, '[]'::JSON),
  (SELECT COUNT(*) FROM confirmed_orders)::BIGINT
FROM revenue_data rd, expenses_data ed, top_products_data tpd;
$$;

-- Function to get product inventory stats with pagination
CREATE OR REPLACE FUNCTION get_product_inventory_stats(
  limit_val INT DEFAULT 100,
  offset_val INT DEFAULT 0
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  stock INT,
  threshold INT,
  unit_of_measurement TEXT,
  price NUMERIC,
  total_sold BIGINT,
  is_low_stock BOOLEAN,
  status TEXT,
  total_count BIGINT
) LANGUAGE SQL STABLE AS $$
SELECT
  p.id,
  p.name,
  p.stock,
  COALESCE(p.restock_threshold, 10),
  COALESCE(p.unit_of_measurement, 'pcs'),
  p.price,
  COALESCE(SUM(oi.qty), 0),
  (p.stock < COALESCE(p.restock_threshold, 10)),
  CASE
    WHEN p.stock = 0 THEN 'outofstock'
    WHEN p.stock < COALESCE(p.restock_threshold, 10) THEN 'low'
    ELSE 'normal'
  END,
  (SELECT COUNT(*) FROM products)
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name, p.stock, p.restock_threshold, p.unit_of_measurement, p.price
ORDER BY p.id
LIMIT limit_val
OFFSET offset_val;
$$;
