ALTER TABLE rrpp_promoters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON rrpp_promoters
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON rrpp_promoters
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON rrpp_promoters
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON rrpp_promoters
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

ALTER TABLE rrpp_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON rrpp_links
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON rrpp_links
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_update" ON rrpp_links
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON rrpp_links
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);
