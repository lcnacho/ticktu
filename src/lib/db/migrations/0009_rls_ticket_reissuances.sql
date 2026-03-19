-- Add tenantId column to ticket_reissuances
ALTER TABLE ticket_reissuances ADD COLUMN tenant_id UUID NOT NULL;

ALTER TABLE ticket_reissuances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON ticket_reissuances
  FOR SELECT USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_insert" ON ticket_reissuances
  FOR INSERT WITH CHECK (auth.jwt()->>'tenant_id' = tenant_id::text);

-- Add missing UPDATE and DELETE policies for scans table
CREATE POLICY "tenant_isolation_update" ON scans
  FOR UPDATE USING (auth.jwt()->>'tenant_id' = tenant_id::text);

CREATE POLICY "tenant_isolation_delete" ON scans
  FOR DELETE USING (auth.jwt()->>'tenant_id' = tenant_id::text);
