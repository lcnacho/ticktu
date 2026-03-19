import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { producers, type Producer } from "@/lib/db/schema/producers";

export async function getProducerByTenantId(tenantId: string): Promise<Producer | null> {
  const [producer] = await db
    .select()
    .from(producers)
    .where(and(eq(producers.tenantId, tenantId), eq(producers.isActive, true)))
    .limit(1);
  return producer ?? null;
}

export async function getProducerBySlug(slug: string): Promise<Producer | null> {
  const [producer] = await db
    .select()
    .from(producers)
    .where(and(eq(producers.slug, slug), eq(producers.isActive, true)))
    .limit(1);
  return producer ?? null;
}

export async function getProducerBranding(tenantId: string) {
  const [producer] = await db
    .select({
      primaryColor: producers.primaryColor,
      accentColor: producers.accentColor,
      logoUrl: producers.logoUrl,
      heroImageUrl: producers.heroImageUrl,
      heroTagline: producers.heroTagline,
      aboutText: producers.aboutText,
      socialLinks: producers.socialLinks,
      config: producers.config,
      name: producers.name,
    })
    .from(producers)
    .where(and(eq(producers.tenantId, tenantId), eq(producers.isActive, true)))
    .limit(1);
  return producer ?? null;
}

export async function updateProducer(
  tenantId: string,
  data: Partial<Omit<Producer, "id" | "tenantId" | "createdAt" | "updatedAt">>,
): Promise<Producer | null> {
  const [updated] = await db
    .update(producers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(producers.tenantId, tenantId))
    .returning();
  return updated ?? null;
}
