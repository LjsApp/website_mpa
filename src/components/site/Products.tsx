import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "@tanstack/react-router";
import { type ProductRow } from "@/lib/site-types";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";

export function Products({ products = [] }: { products?: ProductRow[] }) {
  const containerRef = useScrollAnimate();

  // Show 1 sample per unique category as overview on home
  const seen = new Set<string>();
  const featured = products.filter((p) => {
    if (seen.has(p.category)) return false;
    seen.add(p.category);
    return true;
  }).slice(0, 4); // max 4 categories shown

  if (featured.length === 0) return null;

  return (
    <section id="products" className="py-28" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between mb-12 gap-6" data-animate="fade-up">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Produk & Layanan</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Rangkaian Produk<br /><span className="text-gradient-orange">Industri Lengkap</span>
            </h2>
          </div>
          <Link to="/catalog" className="text-sm uppercase tracking-widest text-primary hover:underline">
            Lihat Semua Katalog →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6" data-animate-stagger>
          {featured.map((p) => (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="industrial-card overflow-hidden group flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-background relative">
                {Array.isArray((p as any).gallery) && (p as any).gallery[0] && <LazyImage src={(p as any).gallery[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />}
                <div className="absolute top-3 left-3 bg-background/85 backdrop-blur border border-border px-2 py-1 text-[10px] uppercase tracking-widest">
                  {p.stock}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5">{p.category_label} · {p.brand}</div>
                <div className="font-display text-base uppercase leading-tight mb-2 group-hover:text-primary transition">{p.name}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
