import { describe, expect, it } from "vitest";
import { producers } from "./producers";
import { getTableColumns } from "drizzle-orm";

describe("producers schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(producers);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("slug");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("logoUrl");
    expect(columnNames).toContain("primaryColor");
    expect(columnNames).toContain("accentColor");
    expect(columnNames).toContain("heroImageUrl");
    expect(columnNames).toContain("heroTagline");
    expect(columnNames).toContain("aboutText");
    expect(columnNames).toContain("socialLinks");
    expect(columnNames).toContain("config");
    expect(columnNames).toContain("currency");
    expect(columnNames).toContain("feePercentage");
    expect(columnNames).toContain("feeFixed");
    expect(columnNames).toContain("isActive");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(producers);

    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.logoUrl.name).toBe("logo_url");
    expect(columns.primaryColor.name).toBe("primary_color");
    expect(columns.accentColor.name).toBe("accent_color");
    expect(columns.heroImageUrl.name).toBe("hero_image_url");
    expect(columns.heroTagline.name).toBe("hero_tagline");
    expect(columns.aboutText.name).toBe("about_text");
    expect(columns.socialLinks.name).toBe("social_links");
    expect(columns.feePercentage.name).toBe("fee_percentage");
    expect(columns.feeFixed.name).toBe("fee_fixed");
    expect(columns.isActive.name).toBe("is_active");
    expect(columns.createdAt.name).toBe("created_at");
    expect(columns.updatedAt.name).toBe("updated_at");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(producers);
    expect(columns.id.primary).toBe(true);
  });
});
