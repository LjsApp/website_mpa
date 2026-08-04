import aboutImg from "@/assets/about-factory.jpg";
import { asTimeline, type CompanyRow } from "@/lib/site-types";
import { LazyImage } from "@/components/ui/lazy-image";

export function About({ company }: { company?: CompanyRow | null }) {
  const timeline = asTimeline(company?.timeline);
  const about = company?.about ?? "";
  const firstYear = timeline[0]?.year;
  const years = firstYear && /^\d{4}$/.test(firstYear)
    ? `${Math.max(1, new Date().getFullYear() - Number(firstYear))}+`
    : null;

  return (
    <section id="about" className="py-28">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-square overflow-hidden border border-border">
            <LazyImage src={aboutImg} alt="Ruang kontrol industri" width={1024} height={1024} className="w-full h-full object-cover" />
          </div>
          {years && (
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 max-w-[220px] hidden md:block">
              <div className="font-display text-4xl">{years}</div>
              <div className="text-xs uppercase tracking-widest mt-1">Tahun Keunggulan Industri</div>
            </div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Tentang {company?.name ?? "Kami"}</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Engineering Yang<br /><span className="text-gradient-orange">Dapat Diandalkan</span>
          </h2>
          {about && <p className="text-muted-foreground mt-5 leading-relaxed whitespace-pre-line">{about}</p>}

          {(company?.vision || company?.mission) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {company?.vision && (
                <div className="border border-border p-5">
                  <div className="text-xs uppercase tracking-widest text-primary mb-1">Visi</div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{company.vision}</p>
                </div>
              )}
              {company?.mission && (
                <div className="border border-border p-5">
                  <div className="text-xs uppercase tracking-widest text-primary mb-1">Misi</div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{company.mission}</p>
                </div>
              )}
            </div>
          )}

          {timeline.length > 0 && (
            <div className="mt-10 space-y-4">
              {timeline.map((t) => (
                <div key={t.year + t.title} className="flex gap-5 border-l-2 border-primary/40 pl-5 py-1">
                  <div className="font-display text-2xl text-primary w-20 shrink-0">{t.year}</div>
                  <div>
                    <div className="font-semibold uppercase tracking-wider text-sm">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
