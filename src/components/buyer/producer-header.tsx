type ProducerHeaderProps = {
  name: string;
  logoUrl: string | null;
};

export function ProducerHeader({ name, logoUrl }: ProducerHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b px-4 py-3">
      {logoUrl && (
        <img src={logoUrl} alt={`${name} logo`} className="h-10 w-auto" />
      )}
      <span className="text-lg font-semibold">{name}</span>
    </header>
  );
}
