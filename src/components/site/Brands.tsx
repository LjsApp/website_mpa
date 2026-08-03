import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { BrandRow } from "@/lib/site-types";
import { LogoGridCarousel } from "@/components/site/LogoGridCarousel";

export const BRAND_CATEGORIES = [
  "Automation",
  "Electrical",
  "Instrumentation",
  "Bearings",
  "Pumps",
  "Hydraulics",
  "Pneumatics",
] as const;

export function Brands({ brands = [] }: { brands?: BrandRow[] }) {
  const [active, setActive] = useState("Semua");
  if (brands.length === 0) return null;

  const used = BRAND_CATEGORIES.filter((c) => brands.some((b) => b.category === c));
  const filtered = active === "Semua" ? brands : brands.filter((b) => b.category === active);

  const stats = [
    { value: `${Math.max(brands.length, 80)}+`, label: "Brand Global" },
    { value: "100%", label: "Original Product" },
    { value: "Resmi", label: "Distributor Resmi" },
  ];

  return (
    <section className="py-28 md:py-36 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Dukungan Brand</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Brand Industri Resmi & Terpercaya
          </h2>
          <p className="text-muted-foreground mt-5 leading-relaxed">
            Kami menyediakan produk original dari brand global yang telah dipercaya oleh berbagai
            industri di seluruh dunia.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-14">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-5xl text-primary">{s.value}</div>
              <div className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-muted-foreground mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {used.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {["Semua", ...used].map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`h-10 px-5 rounded-full text-sm transition-all duration-[250ms] ${
                  active === c
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <LogoGridCarousel key={active} items={filtered} rows={2} variant="light" />

        <div className="mt-16 text-center">
          <h3 className="font-display text-2xl md:text-3xl uppercase">
            Tidak menemukan brand yang Anda cari?
          </h3>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
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
