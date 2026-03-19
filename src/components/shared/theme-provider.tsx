import { headers } from "next/headers";
import { getProducerBranding } from "@/lib/db/queries/producers";
import { getProducerBySlug } from "@/lib/db/queries/producers";

async function fetchBrandingBySlug(slug: string) {
  const producer = await getProducerBySlug(slug);
  if (!producer) return null;
  return {
    primaryColor: producer.primaryColor,
    accentColor: producer.accentColor,
    logoUrl: producer.logoUrl,
    heroImageUrl: producer.heroImageUrl,
    heroTagline: producer.heroTagline,
    aboutText: producer.aboutText,
    socialLinks: producer.socialLinks,
    config: producer.config,
    name: producer.name,
  };
}

export async function ThemeProvider({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const slug = headersList.get("x-tenant-slug");

  if (!slug) {
    return <>{children}</>;
  }

  const branding = await fetchBrandingBySlug(slug);

  if (!branding) {
    return <>{children}</>;
  }

  const cssVars = {
    "--producer-primary": branding.primaryColor,
    "--producer-accent": branding.accentColor,
  } as React.CSSProperties;

  return (
    <div style={cssVars} data-producer={slug}>
      {children}
    </div>
  );
}
