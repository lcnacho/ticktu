import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const MIGRATIONS_DIR = join(__dirname);
const SCHEMA_DIR = join(__dirname, "..", "schema");

function getTablesWithTenantId(): string[] {
  const schemaFiles = readdirSync(SCHEMA_DIR).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
  );

  const tables: string[] = [];
  for (const file of schemaFiles) {
    const content = readFileSync(join(SCHEMA_DIR, file), "utf-8");
    // Match pgTable("table_name", ...) and check for tenant_id
    const tableMatch = content.match(/pgTable\(\s*"([^"]+)"/);
    if (tableMatch && content.includes('tenant_id')) {
      tables.push(tableMatch[1]);
    }
  }
  return tables.sort();
}

function getMigrationSql(): string {
  const migrationFiles = readdirSync(MIGRATIONS_DIR).filter((f) =>
    f.endsWith(".sql"),
  );
  return migrationFiles
    .map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf-8"))
    .join("\n");
}

function getTablesWithRlsEnabled(sql: string): string[] {
  const matches = [...sql.matchAll(/ALTER TABLE (\w+) ENABLE ROW LEVEL SECURITY/g)];
  return [...new Set(matches.map((m) => m[1]))].sort();
}

function getTablesWithSelectPolicy(sql: string): string[] {
  const matches = [
    ...sql.matchAll(/CREATE POLICY "tenant_isolation_select" ON (\w+)/g),
  ];
  return [...new Set(matches.map((m) => m[1]))].sort();
}

function getPoliciesForTable(
  sql: string,
  table: string,
): string[] {
  const regex = new RegExp(
    `CREATE POLICY "(tenant_isolation_\\w+)" ON ${table}`,
    "g",
  );
  return [...sql.matchAll(regex)].map((m) => m[1]).sort();
}

describe("RLS Coverage", () => {
  const tablesWithTenantId = getTablesWithTenantId();
  const migrationSql = getMigrationSql();
  const tablesWithRls = getTablesWithRlsEnabled(migrationSql);
  const tablesWithSelect = getTablesWithSelectPolicy(migrationSql);

  it("should have identified tenant-scoped tables", () => {
    expect(tablesWithTenantId.length).toBeGreaterThan(0);
  });

  it("every table with tenant_id has RLS enabled", () => {
    const missing = tablesWithTenantId.filter(
      (t) => !tablesWithRls.includes(t),
    );
    expect(missing).toEqual([]);
  });

  it("every table with RLS has a SELECT policy", () => {
    const missing = tablesWithRls.filter(
      (t) => !tablesWithSelect.includes(t),
    );
    expect(missing).toEqual([]);
  });

  it("all policies use auth.jwt tenant_id check", () => {
    const policyLines = migrationSql
      .split("\n")
      .filter((l) => l.includes("USING") || l.includes("WITH CHECK"));

    for (const line of policyLines) {
      expect(line).toContain("auth.jwt()->>'tenant_id'");
    }
  });

  for (const table of tablesWithTenantId) {
    describe(`table: ${table}`, () => {
      it("has RLS enabled", () => {
        expect(tablesWithRls).toContain(table);
      });

      it("has SELECT policy", () => {
        const policies = getPoliciesForTable(migrationSql, table);
        expect(policies).toContain("tenant_isolation_select");
      });
    });
  }
});
