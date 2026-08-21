import type { ClientRow, CompanyRow } from "@/lib/site-types";
import { asCompanyStats } from "@/lib/site-types";
import { EmbeddedDeliveryMap } from "@/components/site/DeliveryMap";

export function Clients({ clients = [], company }: { clients?: ClientRow[], company?: CompanyRow | null }) {
  if (clients.length === 0) return null;

  const stats = asCompanyStats(company?.stats).clients;

  // Format clients for the map
  const locations = clients
    .map((c: any) => ({
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      pinIcon: c.pin_icon || "default"
    }))
    .filter((loc: any) => loc.lat && loc.lng);

  return (
    <section id="clients" className="py-28 md:py-36 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-4">Klien Kami</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight mb-6">
            Dipercaya Oleh Industri
          </h2>
          <p className="text-primary-foreground/70 mt-5 mb-6 leading-relaxed text-lg">
            Lebih dari 50+ perusahaan dari berbagai sektor industri telah mempercayakan kebutuhan
            mereka kepada kami.
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-4 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl md:text-4xl text-accent">{s.value}</div>
                <div className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {locations.length > 0 && (
          <div>
            <EmbeddedDeliveryMap locations={locations} />
          </div>
        )}
      </div>
    </section>
  );
}
