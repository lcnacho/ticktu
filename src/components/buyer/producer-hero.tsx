type ProducerHeroProps = {
  heroImageUrl: string | null;
  heroTagline: string | null;
  visible: boolean;
};

export function ProducerHero({ heroImageUrl, heroTagline, visible }: ProducerHeroProps) {
  if (!visible) return null;

  return (
    <section
      className="relative flex min-h-[300px] items-center justify-center bg-cover bg-center"
      style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : undefined}
    >
      {heroImageUrl && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      {heroTagline && (
        <h1 className="relative z-10 text-center text-4xl font-bold text-white drop-shadow-lg">
          {heroTagline}
        </h1>
      )}
    </section>
  );
}
