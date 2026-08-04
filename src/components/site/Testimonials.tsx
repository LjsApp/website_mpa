import type { TestimonialRow } from "@/lib/site-types";
import { useCompanyState } from "@/hooks/use-company";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";

export function Testimonials({ items = [] }: { items?: TestimonialRow[] }) {
  const { company } = useCompanyState();
  const companyName = company?.name || "";
  const containerRef = useScrollAnimate();

  if (items.length === 0) return null;
  return (
    <section className="py-28" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-14" data-animate="fade-up">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Testimoni</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Kata Klien Kami{companyName && (<><br /><span className="text-gradient-orange">Tentang {companyName}</span></>)}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6" data-animate-stagger>
          {items.map((t) => (
            <div key={t.id} className="industrial-card p-7 flex flex-col">
              <svg className="w-10 h-10 text-primary mb-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v10H3V13c0-3.3 1.7-5.7 4-6zm10 0h4v10h-8V13c0-3.3 1.7-5.7 4-6z"/></svg>
              <p className="text-muted-foreground leading-relaxed flex-1">"{t.quote}"</p>
              <div className="mt-6 pt-5 border-t border-border">
                <div className="font-semibold">{t.name}</div>
                {t.role && <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{t.role}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
