type Item = { id: string | number; name: string; logo_url?: string | null };

function LogoCard({ item }: { item: Item }) {
  return (
    <div className="group h-[104px] w-full rounded-2xl bg-white border border-border/60 shadow-[0_2px_10px_-6px_rgb(16_51_41_/_0.25)] p-6 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_18px_36px_-18px_rgb(16_51_41_/_0.4)] hover:border-primary/40">
      {item.logo_url ? (
        <img
          src={item.logo_url}
          alt={item.name}
          loading="lazy"
          className="max-h-12 w-auto object-contain grayscale opacity-70 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
        />
      ) : (
        <div className="font-display text-xl tracking-wide text-muted-foreground transition group-hover:text-primary">
          {item.name}
        </div>
      )}
      {item.logo_url && (
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-center leading-tight line-clamp-1">
          {item.name}
        </div>
      )}
    </div>
  );
}

function Row({
  items,
  reverse,
  variant,
  duration,
}: {
  items: Item[];
  reverse?: boolean;
  variant: "brand" | "client";
  duration: number;
}) {
  if (items.length === 0) return null;
  let base = items;
  while (base.length < 8) base = [...base, ...items];
  const loop = [...base, ...base];
  return (
    <div className="overflow-hidden marquee-mask">
      <div
        className={`marquee-track flex w-max gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((it, i) => (
          <div key={`${it.id}-${i}`} className="w-48 shrink-0">
            <LogoCard item={it} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee({
  items,
  variant,
}: {
  items: Item[];
  variant: "brand" | "client";
}) {
  if (items.length === 0) return null;
  const mid = Math.ceil(items.length / 2);
  const first = items.slice(0, mid);
  const second = items.length > 1 ? items.slice(mid) : items;
  return (
    <div className="marquee-group space-y-4">
      <Row items={first} variant={variant} duration={34} />
      <Row items={second.length ? second : first} variant={variant} reverse duration={38} />
    </div>
  );
}