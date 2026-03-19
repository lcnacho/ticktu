ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON tickets
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON tickets
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON tickets
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON tickets
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);
