ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON ticket_types
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON ticket_types
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON ticket_types
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON ticket_types
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);
