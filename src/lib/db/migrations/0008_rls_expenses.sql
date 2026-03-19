ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON expenses
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON expenses
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON expenses
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON expenses
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);
