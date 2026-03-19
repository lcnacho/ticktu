ALTER TABLE event_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON event_access_codes
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON event_access_codes
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON event_access_codes
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON event_access_codes
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON scans
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON scans
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);
