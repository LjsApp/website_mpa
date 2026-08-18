"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "@tanstack/react-router";
import { type ProductRow } from "@/lib/site-types";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";

export function Products({ products = [] }: { products?: ProductRow[] }) {
  const containerRef = useScrollAnimate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // default true for safe SSR/mobile first
  const touchStartX = useRef(0);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const visibleCount = isMobile ? 1 : 3;

  // 1 item per kategori
  const seen = new Set<string>();
  const featured = products.filter((p) => {
    if (seen.has(p.category)) return false;
    seen.add(p.category);
    return true;
  });

  if (featured.length === 0) return null;

  const maxIndex = Math.max(0, featured.length - visibleCount);
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
    <section id="products" className="py-28" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6" data-animate="fade-up">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Produk &amp; Layanan</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Rangkaian Produk<br /><span className="text-gradient-orange">Industri Lengkap</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
            <Link to="/catalog" className="text-sm uppercase tracking-widest text-primary link-slide">
              Lihat Semua Katalog <span className="arrow">→</span>
            </Link>
            {mounted && featured.length > visibleCount && (
              <div className="flex gap-2">
                <button
                  onClick={() => goTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="w-10 h-10 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                  aria-label="Produk sebelumnya"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={() => goTo(currentIndex + 1)}
                  disabled={currentIndex >= maxIndex}
                  className="w-10 h-10 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                  aria-label="Produk selanjutnya"
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
            style={mounted ? { transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` } : {}}
          >
            {featured.map((p) => (
              <div key={p.id} className="w-full md:w-1/3 shrink-0 px-3 first:pl-0 last:pr-0">
                <Link
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="industrial-card overflow-hidden group block h-full"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    {Array.isArray((p as any).gallery) && (p as any).gallery[0] && (
                      <LazyImage
                        src={(p as any).gallery[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    )}
                    <div className="absolute top-3 left-3 bg-background/85 backdrop-blur border border-border px-2 py-1 text-[10px] uppercase tracking-widest">
                      {p.stock}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-3">
                      <span>{p.category_label}</span><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{p.brand}</span>
                    </div>
                    <h3 className="font-display text-xl uppercase mb-2">{p.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
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
