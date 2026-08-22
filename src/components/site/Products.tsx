"use client";
import { useState, useRef, useEffect } from "react";
import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "@tanstack/react-router";
import { type ProductRow } from "@/lib/site-types";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";
import { Button } from "@/components/ui/button";

// Helper function to chunk array into pages
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function Products({ products = [] }: { products?: ProductRow[] }) {
  const containerRef = useScrollAnimate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartX = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Sort all products: featured (true) first, then by name or keep original order
  const sortedProducts = [...products].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0; // Keep original order for the rest
  });

  // 2. Derive unique categories from ALL sorted products
  const categories = [
    { key: "all", label: "Semua" },
    ...Array.from(
      new Map(sortedProducts.map((p) => [p.category, p.category_label])).entries()
    ).map(([key, label]) => ({ key, label })),
  ];

  // 3. Filter products by category
  const filtered =
    activeCategory === "all"
      ? sortedProducts
      : sortedProducts.filter((p) => p.category === activeCategory);

  // 4. Chunk into pages of 9 (3x3)
  const itemsPerPage = 9;
  const pages = chunkArray(filtered, itemsPerPage);
  const maxPage = Math.max(0, pages.length - 1);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, maxPage)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToPage(currentPage + 1); // Swipe left -> next page
      } else {
        goToPage(currentPage - 1); // Swipe right -> prev page
      }
    }
  };

  if (products.length === 0) return null;

  return (
    <section id="products" className="py-16 md:py-20 overflow-hidden" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6" data-animate="fade-up">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Produk &amp; Layanan</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Rangkaian Produk<br /><span className="text-gradient-orange">Industri Lengkap</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
            <Link to="/catalog" className="text-sm uppercase tracking-widest text-primary link-slide">
              Lihat Semua Katalog <span className="arrow">→</span>
            </Link>
            {mounted && pages.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="w-12 h-12 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                  aria-label="Halaman sebelumnya"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= maxPage}
                  className="w-12 h-12 border border-border flex items-center justify-center text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-card transition"
                  aria-label="Halaman selanjutnya"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
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

        {/* Carousel Slider */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-border rounded-lg">
            Belum ada produk dalam kategori ini.
          </div>
        ) : (
          <div
            className="overflow-hidden p-4 -m-4 w-full relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={mounted ? { transform: `translateX(-${currentPage * 100}%)` } : {}}
            >
              {pages.map((pageProducts, pageIndex) => (
                <div key={pageIndex} className="w-full shrink-0">
                  {/* 3x3 Grid for each page */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {pageProducts.map((p) => (
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
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="bg-background/85 backdrop-blur border border-border px-2 py-1 text-[10px] uppercase tracking-widest shadow-sm">
                              {p.stock}
                            </span>
                            {p.is_featured && (
                              <span className="bg-primary/90 text-white backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                Unggulan
                              </span>
                            )}
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
