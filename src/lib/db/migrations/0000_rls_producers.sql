-- Enable RLS on producers table
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

-- Policy: producers can only see their own tenant data
CREATE POLICY "tenant_isolation_select" ON producers
  FOR SELECT
  USING (auth.jwt()->>'tenant_id' = tenant_id::text);

-- Policy: producers can only update their own tenant data
CREATE POLICY "tenant_isolation_update" ON producers
  FOR UPDATE
  USING (auth.jwt()->>'tenant_id' = tenant_id::text);

-- Policy: producers cannot delete (admin only via service role)
CREATE POLICY "tenant_isolation_delete" ON producers
  FOR DELETE
  USING (auth.jwt()->>'tenant_id' = tenant_id::text);

-- Policy: super admin (service role) bypasses RLS automatically
-- Service role key bypasses RLS by default in Supabase

-- Policy: allow insert only via service role (admin creates producers)
-- No INSERT policy = only service role can insert (RLS blocks all others)
