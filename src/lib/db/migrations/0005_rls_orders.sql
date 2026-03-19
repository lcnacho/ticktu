ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON orders
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON orders
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON orders
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON orders
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON order_items
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON order_items
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON order_items
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON order_items
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);
