import { useState } from "react";
import type { TestimonialRow } from "@/lib/site-types";
import { useCompanyState } from "@/hooks/use-company";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";

export function Testimonials({ items = [] }: { items?: TestimonialRow[] }) {
  const { company } = useCompanyState();
  const companyName = company?.name || "";
  const containerRef = useScrollAnimate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (items.length === 0) return null;

  const maxIndex = Math.max(0, items.length - 3);
  const visibleItems = items.slice(currentIndex, currentIndex + 3);

  const next = () => {
    if (currentIndex < maxIndex) {
      setDirection(1);
      setCurrentIndex((p) => p + 1);
    }
  };
  const prev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((p) => p - 1);
    }
  };

  return (
    <section className="py-28 overflow-hidden" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6" data-animate="fade-up">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Testimoni</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Kata Klien Kami{companyName && (<><br /><span className="text-gradient-orange">Tentang {companyName}</span></>)}
            </h2>
          </div>
          
          {items.length > 3 && (
            <div className="flex gap-2">
              <button 
                onClick={prev} 
                disabled={currentIndex === 0}
                className="w-12 h-12 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                aria-label="Testimoni sebelumnya"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button 
                onClick={next}
                disabled={currentIndex >= maxIndex}
                className="w-12 h-12 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                aria-label="Testimoni selanjutnya"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          )}
        </div>
        <div 
          key={currentIndex} 
          className={`grid md:grid-cols-3 gap-6 animate-in fade-in duration-500 ${
            direction === 1 ? "slide-in-from-right-8" : "slide-in-from-left-8"
          }`}
        >
          {visibleItems.map((t) => (
            <div key={t.id} className="industrial-card p-7 flex flex-col">
              <svg className="w-10 h-10 text-primary mb-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v10H3V13c0-3.3 1.7-5.7 4-6zm10 0h4v10h-8V13c0-3.3 1.7-5.7 4-6z"/></svg>
              <p className="text-muted-foreground leading-relaxed flex-1 text-justify">"{t.quote}"</p>
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
