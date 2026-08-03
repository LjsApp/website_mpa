import type { ClientRow } from "@/lib/site-types";
import { LogoGridCarousel } from "@/components/site/LogoGridCarousel";

export function Clients({ clients = [] }: { clients?: ClientRow[] }) {
  if (clients.length === 0) return null;

  const stats = [
    { value: "500+", label: "Perusahaan" },
    { value: "25+", label: "Industri" },
    { value: "10+", label: "Tahun Pengalaman" },
  ];

  return (
    <section id="clients" className="py-28 md:py-36 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Klien Kami</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Dipercaya Oleh Industri Terkemuka
          </h2>
          <p className="text-primary-foreground/70 mt-5 leading-relaxed">
            Lebih dari 500+ perusahaan dari berbagai sektor industri telah mempercayakan kebutuhan
            mereka kepada kami.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-14">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-5xl text-accent">{s.value}</div>
              <div className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-primary-foreground/65 mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <LogoGridCarousel items={clients} rows={2} variant="dark" />
      </div>
    </section>
  );
}
