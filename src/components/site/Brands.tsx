import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { BrandRow, CompanyRow } from "@/lib/site-types";
import { asCompanyStats } from "@/lib/site-types";
import { LogoGridCarousel } from "@/components/site/LogoGridCarousel";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";
import { useCounter, parseStat } from "@/hooks/use-counter";

export const BRAND_CATEGORIES = [
  "Automation",
  "Electrical",
  "Instrumentation",
  "Bearings",
  "Pumps",
  "Hydraulics",
  "Pneumatics",
] as const;

function BrandStatItem({ rawValue, label }: { rawValue: string; label: string }) {
  const parsed = parseStat(rawValue);
  // Just trigger directly since this is simple
  const count = useCounter(parsed.value, 1500, true);
  const displayValue = parsed.value > 0 ? `${count}${parsed.suffix}` : rawValue;

  return (
    <div className="text-center">
      <div className="font-display text-3xl md:text-5xl text-primary">{displayValue}</div>
      <div className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-muted-foreground mt-2">
        {label}
      </div>
    </div>
  );
}

export function Brands({ brands = [], company }: { brands?: BrandRow[], company?: CompanyRow | null }) {
  const [active, setActive] = useState("Semua");
  const containerRef = useScrollAnimate();

  if (brands.length === 0) return null;

  const used = BRAND_CATEGORIES.filter((c) => brands.some((b) => b.category === c));
  const filtered = active === "Semua" ? brands : brands.filter((b) => b.category === active);

  const stats = asCompanyStats(company?.stats).brands;

  return (
    <section className="py-28 md:py-36 bg-white" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mx-auto mb-14" data-animate="fade-up">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Dukungan Brand</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Brand Industri Resmi & Terpercaya
          </h2>
          <p className="text-muted-foreground mt-5 leading-relaxed md:whitespace-nowrap">
            Kami menyediakan produk original dari brand global yang telah dipercaya oleh berbagai
            industri .
          </p>
        </div>

        <div className="flex justify-center gap-16 mb-14" data-animate-stagger>
          {stats.map((s) => (
            <div key={s.label} className="animate-child">
              <BrandStatItem rawValue={s.value} label={s.label} />
            </div>
          ))}
        </div>

        {used.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12" data-animate="fade-up">
            {["Semua", ...used].map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`h-10 px-5 rounded-full text-sm transition-all duration-[250ms] ${active === c
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div data-animate="fade-up">
          <LogoGridCarousel key={active} items={filtered} rows={2} variant="light" />
        </div>

        <div className="mt-16 text-center" data-animate="fade-up">
          <h3 className="font-display text-2xl md:text-3xl uppercase">
            Tidak menemukan brand yang Anda cari?
          </h3>
          <p className="text-muted-foreground mt-3 md:whitespace-nowrap">
            Tim kami siap membantu mencari solusi terbaik sesuai kebutuhan industri Anda.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-shine mt-7 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold uppercase tracking-wider transition-transform duration-300 hover:scale-105"
          >
            Hubungi Kami
          </button>
        </div>
      </div>
    </section>
  );
}
