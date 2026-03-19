type ProducerSocialLinksProps = {
  socialLinks: Record<string, string> | null;
  visible: boolean;
};

export function ProducerSocialLinks({ socialLinks, visible }: ProducerSocialLinksProps) {
  if (!visible || !socialLinks || Object.keys(socialLinks).length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold">Redes sociales</h2>
      <div className="flex gap-4">
        {Object.entries(socialLinks).map(([platform, url]) => (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--producer-primary,#6366f1)] underline hover:opacity-80"
          >
            {platform}
          </a>
        ))}
      </div>
    </section>
  );
}
