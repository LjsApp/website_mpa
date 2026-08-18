"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { TestimonialRow } from "@/lib/site-types";
import { useCompanyState } from "@/hooks/use-company";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";

export function Testimonials({ items = [] }: { items?: TestimonialRow[] }) {
  const { company } = useCompanyState();
  const companyName = company?.name || "";
  const containerRef = useScrollAnimate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const touchStartX = useRef(0);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const visibleCount = isMobile ? 1 : 3;

  // Only show active testimonials; hide entire section if none
  const activeItems = items.filter((t) => t.is_active !== false);

  if (activeItems.length === 0) return null;

  const maxIndex = Math.max(0, activeItems.length - visibleCount);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
  }, [maxIndex]);

  useEffect(() => {
    if (!mounted) return;
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [mounted, startAuto]);

  const goTo = (idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(idx, maxIndex)));
    startAuto();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(currentIndex + (diff > 0 ? 1 : -1));
  };

  return (
    <section className="py-28 overflow-hidden" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6" data-animate="fade-up">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Testimoni</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Kata Klien Kami{companyName && (<><br /><span className="text-gradient-orange md:whitespace-nowrap">Tentang {companyName}</span></>)}
            </h2>
          </div>

          {mounted && activeItems.length > visibleCount && (
            <div className="flex gap-2">
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="w-12 h-12 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                aria-label="Testimoni sebelumnya"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex >= maxIndex}
                className="w-12 h-12 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                aria-label="Testimoni selanjutnya"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* Carousel Track */}
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={mounted ? { transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` } : {}}
          >
            {activeItems.map((t) => (
              <div key={t.id} className="w-full md:w-1/3 shrink-0 px-3 first:pl-0 last:pr-0">
                <div className="industrial-card p-7 flex flex-col h-full">
                  <svg className="w-10 h-10 text-primary mb-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v10H3V13c0-3.3 1.7-5.7 4-6zm10 0h4v10h-8V13c0-3.3 1.7-5.7 4-6z"/></svg>
                  <p className="text-muted-foreground leading-relaxed flex-1 text-justify hyphens-auto">"{t.quote}"</p>
                  <div className="mt-6 pt-5 border-t border-border">
                    <div className="font-semibold">{t.name}</div>
                    {t.role && <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{t.role}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
