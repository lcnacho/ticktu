type ProducerAboutProps = {
  aboutText: string | null;
  visible: boolean;
};

export function ProducerAbout({ aboutText, visible }: ProducerAboutProps) {
  if (!visible || !aboutText) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="mb-4 text-2xl font-bold">Sobre nosotros</h2>
      <p className="text-gray-700">{aboutText}</p>
    </section>
  );
}
