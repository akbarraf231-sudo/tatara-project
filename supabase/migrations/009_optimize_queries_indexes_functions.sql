-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_archived_at ON orders(archived_at);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_orders ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);

-- Function to get dashboard metrics (fast aggregation at DB level)
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue NUMERIC,
  confirmed_orders BIGINT,
  total_items_sold BIGINT,
  total_expenses NUMERIC,
  total_profit NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM orders WHERE archived_at IS NULL)::BIGINT,
    COALESCE(SUM(total), 0)::NUMERIC FROM orders WHERE archived_at IS NULL AND (status = 'confirmed' OR status = 'completed'),
    (SELECT COUNT(*) FROM orders WHERE archived_at IS NULL AND (status = 'confirmed' OR status = 'completed'))::BIGINT,
    COALESCE(SUM(qty), 0)::BIGINT FROM order_items,
    COALESCE(SUM(amount), 0)::NUMERIC FROM expenses,
    COALESCE((SELECT SUM(total) FROM orders WHERE archived_at IS NULL AND (status = 'confirmed' OR status = 'completed')), 0)::NUMERIC -
    COALESCE((SELECT SUM(amount) FROM expenses), 0)::NUMERIC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get insights with pagination
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
) AS $$
DECLARE
  today_date DATE;
  month_start_date DATE;
BEGIN
  today_date := CURRENT_DATE;
  month_start_date := DATE_TRUNC('month', CURRENT_TIMESTAMP)::DATE;

  RETURN QUERY
  WITH confirmed_orders AS (
    SELECT id, total, created_at, order_type
    FROM orders
    WHERE status IN ('confirmed', 'completed') AND archived_at IS NULL
  ),
  top_products_agg AS (
    SELECT
      product_id,
      p.name,
      SUM(oi.qty) as total_qty,
      SUM(oi.price * oi.qty) as total_revenue
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    GROUP BY product_id, p.name
    ORDER BY total_revenue DESC
    LIMIT 10
  ),
  all_expenses AS (
    SELECT SUM(amount)::NUMERIC as total_expenses FROM expenses
  )
  SELECT
    COALESCE(SUM(co.total), 0)::NUMERIC,
    COALESCE(SUM(CASE WHEN DATE(co.created_at) = today_date THEN co.total ELSE 0 END), 0)::NUMERIC,
    COALESCE(SUM(CASE WHEN DATE(co.created_at) >= month_start_date THEN co.total ELSE 0 END), 0)::NUMERIC,
    COALESCE(SUM(CASE WHEN co.order_type != 'special' THEN co.total ELSE 0 END), 0)::NUMERIC,
    COALESCE(SUM(CASE WHEN co.order_type = 'special' THEN co.total ELSE 0 END), 0)::NUMERIC,
    (SELECT total_expenses FROM all_expenses),
    COALESCE(SUM(co.total), 0) - COALESCE((SELECT total_expenses FROM all_expenses), 0),
    CASE
      WHEN COALESCE(SUM(co.total), 0) > 0
      THEN ROUND(((COALESCE(SUM(co.total), 0) - COALESCE((SELECT total_expenses FROM all_expenses), 0)) / COALESCE(SUM(co.total), 0) * 100), 1)::NUMERIC
      ELSE 0::NUMERIC
    END,
    COALESCE(JSON_AGG(
      JSON_BUILD_OBJECT('name', tpa.name, 'qty', tpa.total_qty, 'revenue', tpa.total_revenue)
      ORDER BY tpa.total_revenue DESC
    ), '[]'::JSON),
    (SELECT COUNT(*) FROM confirmed_orders)::BIGINT
  FROM confirmed_orders co, top_products_agg tpa
  GROUP BY tpa.total_qty
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get product inventory stats with pagination
CREATE OR REPLACE FUNCTION get_product_inventory_stats(
  limit_val INT DEFAULT 100,
  offset_val INT DEFAULT 0
)
RETURNS TABLE (
  product_id BIGINT,
  product_name TEXT,
  stock INT,
  threshold INT,
  unit_of_measurement TEXT,
  price NUMERIC,
  total_sold BIGINT,
  is_low_stock BOOLEAN,
  status TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH product_sales AS (
    SELECT
      p.id,
      p.name,
      p.stock,
      COALESCE(p.restock_threshold, 10) as threshold,
      COALESCE(p.unit_of_measurement, 'pcs') as unit,
      p.price,
      COALESCE(SUM(oi.qty), 0)::BIGINT as total_qty
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    GROUP BY p.id, p.name, p.stock, p.restock_threshold, p.unit_of_measurement, p.price
  )
  SELECT
    ps.id,
    ps.name,
    ps.stock,
    ps.threshold,
    ps.unit,
    ps.price,
    ps.total_qty,
    CASE WHEN ps.stock < ps.threshold THEN true ELSE false END,
    CASE
      WHEN ps.stock = 0 THEN 'outofstock'::TEXT
      WHEN ps.stock < ps.threshold THEN 'low'::TEXT
      ELSE 'normal'::TEXT
    END,
    (SELECT COUNT(*) FROM product_sales)::BIGINT
  FROM product_sales
  ORDER BY ps.id
  LIMIT limit_val
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;
