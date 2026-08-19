import { useState, useEffect } from "react";
import heroImg from "@/assets/hero-industrial.jpg";
import { asCompanyStats, type CompanyRow } from "@/lib/site-types";
import { LazyImage } from "@/components/ui/lazy-image";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";
import { useCounter, parseStat } from "@/hooks/use-counter";
import { useTypewriter } from "@/hooks/use-typewriter";

const badges = ["Mitra Terpercaya", "Pengadaan Cepat", "Layanan Nasional", "Dukungan Teknis"];

function StatItem({ rawValue, label }: { rawValue: string; label: string }) {
  const [trigger, setTrigger] = useState(false);
  const containerRef = useScrollAnimate();

  useEffect(() => {
    // Manually trigger counter when this enters viewport
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setTrigger(true);
    }, { threshold: 0.5 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  const parsed = parseStat(rawValue);
  // Only animate if it's a number
  const count = useCounter(parsed.value, 1500, trigger);
  const displayValue = parsed.value > 0 ? `${count}${parsed.suffix}` : rawValue;

  return (
    <div ref={containerRef as any}>
      <div className="font-display text-3xl md:text-4xl text-primary">{displayValue}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export function Hero({ company }: { company?: CompanyRow | null }) {
  const stats = asCompanyStats(company?.stats).hero;
  const containerRef = useScrollAnimate();

  const typeText = useTypewriter(["Terintegrasi", "Terbaik", "Inovatif", "Profesional"], 120, 2500);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden" ref={containerRef as any}>
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Floating Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => {
          // Use deterministic values based on index to prevent SSR hydration mismatch
          const seed = i + 1;
          return (
            <div
              key={i}
              className="absolute bg-primary/20 rounded-full animate-float"
              style={{
                width: ((seed * 17) % 8) + 4 + 'px',
                height: ((seed * 23) % 8) + 4 + 'px',
                left: ((seed * 31) % 100) + '%',
                top: ((seed * 47) % 100) + '%',
                animationDelay: `${(seed * 13) % 5}s`,
                animationDuration: `${((seed * 19) % 4) + 4}s`,
              }}
            />
          );
        })}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/70" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div data-animate="fade-up">
          <div className="inline-flex items-center gap-2 border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-6">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            Supply Industri & Engineering
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] uppercase font-bold">
            Solusi Industrial<br />
            <span className="text-gradient-orange">Supply & Engineering</span><br />
            <span className="min-w-[300px] inline-block">{typeText}<span className="animate-pulse">_</span></span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Menghadirkan solusi engineering, spare part supply, maintenance, reliability, serta teknologi digital untuk membantu industri bekerja lebih andal, efisien, dan berkelanjutan
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-primary text-primary-foreground px-7 py-3.5 font-semibold uppercase tracking-wider text-sm hover:brightness-110 transition glow-orange"
            >
              Minta Penawaran
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="border border-border px-7 py-3.5 font-semibold uppercase tracking-wider text-sm hover:bg-card transition"
            >
              Jelajahi Produk
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {badges.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {b}
              </div>
            ))}
          </div>
        </div>
        <div className="relative" data-animate="scale-in">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative aspect-[4/5] overflow-hidden border border-border">
            <LazyImage src={heroImg} alt="Operasi engineering industri" width={1536} height={1024} className="w-full h-full object-cover object-[75%_center]" eager />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`py-6 px-4 ${i < 3 ? "md:border-r border-border" : ""} ${i < 2 ? "border-r md:border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}>
              <StatItem rawValue={s.value} label={s.label} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
