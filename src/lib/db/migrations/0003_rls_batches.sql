ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON batches
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON batches
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON batches
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON batches
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);
