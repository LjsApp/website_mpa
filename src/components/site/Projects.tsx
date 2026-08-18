"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "@tanstack/react-router";
import type { ProjectRow } from "@/lib/site-types";

const VISIBLE = 3;

export function Projects({ projects = [] }: { projects?: ProjectRow[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  if (projects.length === 0) return null;

  const maxIndex = Math.max(0, projects.length - VISIBLE);
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
    <section id="projects" className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Pengalaman Proyek</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Proyek Terbaru<br /><span className="text-gradient-orange">Berjalan/ Selesai</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
            <Link to="/projects" className="text-sm uppercase tracking-widest text-primary link-slide">
              Lihat Semua Proyek <span className="arrow">→</span>
            </Link>
            {mounted && projects.length > VISIBLE && (
              <div className="flex gap-2">
                <button
                  onClick={() => goTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="w-10 h-10 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                  aria-label="Proyek sebelumnya"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={() => goTo(currentIndex + 1)}
                  disabled={currentIndex >= maxIndex}
                  className="w-10 h-10 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                  aria-label="Proyek selanjutnya"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Track */}
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={mounted ? { transform: `translateX(-${currentIndex * (100 / VISIBLE)}%)` } : {}}
          >
            {projects.map((p) => (
              <div key={p.id} className="w-full md:w-1/3 shrink-0 px-3 first:pl-0 last:pr-0">
                <Link to="/projects/$slug" params={{ slug: p.slug }} className="industrial-card overflow-hidden group block h-full">
                  <div className="aspect-[4/3] overflow-hidden">
                    {Array.isArray((p as any).gallery) && (p as any).gallery[0] && (
                      <LazyImage src={(p as any).gallery[0]} alt={p.title} width={1024} height={768} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-3">
                      <span>{p.category}</span><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{(p as any).project_date?.slice(0, 4)}</span>
                    </div>
                    <h3 className="font-display text-xl uppercase mb-2">{p.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {p.location}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary border border-primary/40 px-3 py-1.5">
                      <span className="w-1.5 h-1.5 bg-primary" /> {p.status}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
