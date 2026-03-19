ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON events
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON events
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON events
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON events
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);
