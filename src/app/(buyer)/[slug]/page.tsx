import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getProducerBySlug } from "@/lib/db/queries/producers";
import { getPublishedEventsByTenant } from "@/lib/db/queries/events";
import { ProducerHeader } from "@/components/buyer/producer-header";
import { ProducerHero } from "@/components/buyer/producer-hero";
import { ProducerAbout } from "@/components/buyer/producer-about";
import { ProducerSocialLinks } from "@/components/buyer/producer-social-links";
import { BuyerEventCard } from "@/components/buyer/event-card";
import { PoweredByFooter } from "@/components/buyer/powered-by-footer";

async function getProducerData(slug: string) {
  "use cache";
  cacheTag(`tenant-${slug}`);

  const producer = await getProducerBySlug(slug);
  if (!producer) return null;

  const events = await getPublishedEventsByTenant(producer.tenantId);

  return { producer, events };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProducerData(slug);

  if (!data) {
    return { title: "No encontrado" };
  }

  return {
    title: `${data.producer.name} | Ticktu`,
    description: data.producer.aboutText ?? `Eventos de ${data.producer.name}`,
    openGraph: {
      title: data.producer.name,
      description:
        data.producer.aboutText ?? `Eventos de ${data.producer.name}`,
      images: data.producer.heroImageUrl
        ? [{ url: data.producer.heroImageUrl }]
        : [],
    },
  };
}

async function ProducerLandingContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  const { slug } = await paramsPromise;
  const data = await getProducerData(slug);

  if (!data) {
    notFound();
  }

  const { producer, events } = data;
  const config = producer.config as {
    heroVisible: boolean;
    socialVisible: boolean;
    aboutVisible: boolean;
  };

  return (
    <>
      <ProducerHeader name={producer.name} logoUrl={producer.logoUrl} />

      <ProducerHero
        heroImageUrl={producer.heroImageUrl}
        heroTagline={producer.heroTagline}
        visible={config.heroVisible}
      />

      <main className="px-4 py-6">
        {events.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Eventos</h2>
            {events.map((event) => (
              <BuyerEventCard
                key={event.id}
                name={event.name}
                date={event.date}
                venue={event.venue}
                imageUrl={event.imageUrl}
                href={`/events/${event.slug}`}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">
              No hay eventos disponibles en este momento.
            </p>
          </div>
        )}
      </main>

      <ProducerAbout
        aboutText={producer.aboutText}
        visible={config.aboutVisible}
      />

      <ProducerSocialLinks
        socialLinks={producer.socialLinks}
        visible={config.socialVisible}
      />

      <PoweredByFooter />
    </>
  );
}

export default function ProducerLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="mx-auto max-w-[480px]">
      <Suspense
        fallback={
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-gray-400">Cargando...</p>
          </div>
        }
      >
        <ProducerLandingContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
