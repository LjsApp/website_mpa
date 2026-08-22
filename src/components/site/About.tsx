import aboutImg from "@/assets/about-factory.jpg";
import antiBribeImg from "@/assets/anti-bribe.jpg";
import { asTimeline, type CompanyRow } from "@/lib/site-types";
import { LazyImage } from "@/components/ui/lazy-image";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";
import { DocumentDownloads } from "@/components/site/DocumentDownloads";

export function About({ company }: { company?: CompanyRow | null }) {
  const timeline = asTimeline(company?.timeline);
  const about = company?.about ?? "";
  const firstYear = timeline[0]?.year;
  const years = firstYear && /^\d{4}$/.test(firstYear)
    ? `${Math.max(1, new Date().getFullYear() - Number(firstYear))}+`
    : null;

  const containerRef = useScrollAnimate();

  const AntiBribeCard = (
    <div className="flex flex-col gap-8 bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="overflow-hidden rounded-xl border border-border/50">
        <LazyImage src={antiBribeImg} alt="Anti Bribe Campaign" width={800} height={400} className="w-full h-auto object-cover" />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-display text-2xl uppercase text-primary mb-1">Company Policy</h3>
          <p className="text-muted-foreground italic">Integrity is the key to success</p>
        </div>

        <div className="border-l-4 border-[#e11d48] pl-4 py-1">
          <h3 className="font-display text-xl uppercase text-[#e11d48] mb-1">No Bribe - Anti Suap</h3>
          <p className="text-foreground font-medium text-sm leading-relaxed">
            Kami memilih kepercayaan dan nama baik lebih dari pada omset dan margin
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">The Words</h3>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground italic border-b border-border/50 pb-2">
              "Bribe blinds those who see and twists the words of the innocent"
            </p>
            <p className="text-sm text-muted-foreground italic border-b border-border/50 pb-2">
              "The wicked accept bribes in secret to pervert the course of justice"
            </p>
            <p className="text-sm text-muted-foreground italic">
              "He that is greedy of gain troubleth his own house; but he that hateth gifts shall live"
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="about" className="py-16 md:py-20" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
        <div className="flex flex-col gap-12" data-animate="fade-right">
          {/* Anti Bribe Section (Desktop) */}
          <div className="hidden lg:block">
            {AntiBribeCard}
          </div>

          {/* Main Photo */}
          <div className="relative">
            <div className="aspect-square overflow-hidden border border-border">
              <LazyImage src={aboutImg} alt="Ruang kontrol industri" width={1024} height={1024} className="w-full h-full object-cover" />
            </div>
            {years && (
              <div className="absolute bottom-0 right-0 md:-bottom-6 md:-right-6 bg-primary text-primary-foreground p-5 md:p-6 max-w-[180px] md:max-w-[220px]">
                <div className="font-display text-3xl md:text-4xl">{years}</div>
                <div className="text-[10px] md:text-xs uppercase tracking-widest mt-1">Tahun Keunggulan Industri</div>
              </div>
            )}
          </div>
        </div>

        <div data-animate="fade-left" className="pt-4 lg:pt-0">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3 md:whitespace-nowrap">Tentang {company?.name ?? "Kami"}</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Engineering Yang<br /><span className="text-gradient-orange">Dapat Diandalkan</span>
          </h2>
          {about && <p className="text-muted-foreground mt-5 leading-relaxed whitespace-pre-line text-justify hyphens-auto">{about}</p>}

          {(company?.vision || company?.mission) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-8" data-animate-stagger>
              {company?.vision && (
                <div className="border border-border p-5">
                  <div className="text-xs uppercase tracking-widest text-primary mb-1">Visi</div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line text-justify hyphens-auto">{company.vision}</p>
                </div>
              )}
              {company?.mission && (
                <div className="border border-border p-5">
                  <div className="text-xs uppercase tracking-widest text-primary mb-1">Misi</div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line text-justify hyphens-auto">{company.mission}</p>
                </div>
              )}
            </div>
          )}

          {timeline.length > 0 && (
            <div className="mt-10 space-y-4" data-animate-stagger>
              {timeline.map((t) => (
                <div key={t.year + t.title} className="flex gap-5 border-l-2 border-primary/40 pl-5 py-1">
                  <div className="font-display text-2xl text-primary w-20 shrink-0">{t.year}</div>
                  <div>
                    <div className="font-semibold uppercase tracking-wider text-sm">{t.title}</div>
                    <div className="text-sm text-muted-foreground text-justify hyphens-auto">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(company as any)?.documents?.length > 0 && (
            <div className="mt-10" data-animate-stagger>
              <DocumentDownloads value={(company as any).documents} title="Dokumen Perusahaan" />
            </div>
          )}

          {/* Anti Bribe Section (Mobile) */}
          <div className="block lg:hidden mt-12">
            {AntiBribeCard}
          </div>
        </div>
      </div>
    </section>
  );
}
