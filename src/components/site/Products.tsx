"use client";
import { useState } from "react";
import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "@tanstack/react-router";
import { type ProductRow } from "@/lib/site-types";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";

export function Products({ products = [] }: { products?: ProductRow[] }) {
  const containerRef = useScrollAnimate();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Only show featured products
  const featured = products.filter((p) => p.is_featured);

  // Derive unique categories from featured products
  const categories = [
    { key: "all", label: "Semua" },
    ...Array.from(
      new Map(featured.map((p) => [p.category, p.category_label])).entries()
    ).map(([key, label]) => ({ key, label })),
  ];

  // Filter by active category, max 9
  const filtered = (
    activeCategory === "all"
      ? featured
      : featured.filter((p) => p.category === activeCategory)
  ).slice(0, 9);

  if (products.length === 0) return null;

  return (
    <section id="products" className="py-28" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6" data-animate="fade-up">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Produk &amp; Layanan</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Rangkaian Produk<br /><span className="text-gradient-orange">Industri Lengkap</span>
            </h2>
          </div>
          <Link to="/catalog" className="text-sm uppercase tracking-widest text-primary link-slide self-start md:self-end">
            Lihat Semua Katalog <span className="arrow">→</span>
          </Link>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10" data-animate="fade-up">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 border ${
                  activeCategory === cat.key
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* 3×3 Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-border rounded-lg">
            {featured.length === 0
              ? "Belum ada produk unggulan. Centang \"Tampilkan di Beranda\" pada manajemen produk."
              : "Belum ada produk dalam kategori ini."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" data-animate="fade-up">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="industrial-card overflow-hidden group block"
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
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-2">
                    <span>{p.category_label}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{p.brand}</span>
                  </div>
                  <h3 className="font-display text-lg uppercase mb-1">{p.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
