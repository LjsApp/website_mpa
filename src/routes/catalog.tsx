import { LazyImage } from "@/components/ui/lazy-image";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { listProducts, listProductCategories, listBrands } from "@/lib/public.functions";
import { asStringList, type ProductRow } from "@/lib/site-types";

const productsQuery = queryOptions({
  queryKey: ["products-public"],
  queryFn: () => listProducts(),
});

const productCategoriesQuery = queryOptions({
  queryKey: ["product-categories-public"],
  queryFn: () => listProductCategories(),
});

const brandsQuery = queryOptions({
  queryKey: ["brands-public"],
  queryFn: () => listBrands(),
});

type CatalogSearch = {
  category?: string;
};

export const Route = createFileRoute("/catalog")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => {
    return {
      category: search.category as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Katalog" },
      { name: "description", content: "Jelajahi katalog lengkap produk industri: mechanical, electrical, instrumentation & equipment dari brand terpercaya." },
      { property: "og:title", content: "Katalog Produk Industri" },
      { property: "og:description", content: "Telusuri produk industri lengkap dengan filter kategori, brand, dan ketersediaan stok." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(productCategoriesQuery),
      context.queryClient.ensureQueryData(brandsQuery),
    ]),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <p className="text-muted-foreground">Gagal memuat katalog: {error.message}</p>
    </div>
  ),
  component: CatalogPage,
});

type SortKey = "name" | "brand" | "category";

function CatalogPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(productCategoriesQuery);
  const { data: brands } = useSuspenseQuery(brandsQuery);
  const searchParams = Route.useSearch();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>(searchParams.category || "all");
  const [brand, setBrand] = useState<string>("all");
  const [stock, setStock] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("name");

  const allBrands = useMemo(
    () => (brands as { name: string }[]).map((b) => b.name),
    [brands],
  );

  useEffect(() => {
    if (searchParams.category) {
      setCat(searchParams.category);
    }
  }, [searchParams.category]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list: ProductRow[] = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (stock !== "all" && p.stock !== stock) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        asStringList(p.applications).some((a) => a.toLowerCase().includes(q))
      );
    });
    list = [...list].sort((a, b) => String(a[sort]).localeCompare(String(b[sort])));
    return list;
  }, [products, search, cat, brand, stock, sort]);

  const reset = () => {
    setSearch(""); setCat("all"); setBrand("all"); setStock("all"); setSort("name");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24">
        <section className="border-b border-border bg-card/30 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Katalog Produk</div>
                <h1 className="font-display text-4xl md:text-5xl uppercase leading-tight">
                  Jelajahi Seluruh <span className="text-gradient-orange">Produk Industri</span>
                </h1>
              </div>
              <nav className="text-xs uppercase tracking-widest text-muted-foreground shrink-0 mt-1">
                <Link to="/" className="hover:text-primary">Beranda</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">Katalog</span>
              </nav>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Temukan komponen industri original dari brand terpercaya. Gunakan pencarian dan filter untuk menemukan produk yang sesuai dengan kebutuhan operasional Anda.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[280px_1fr] gap-10">
            {/* Sidebar Filters */}
            <aside className="space-y-8">
              <div>
                <label className="text-xs uppercase tracking-widest text-primary mb-2 block">Cari Produk</label>
                <div className="relative">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nama, brand, aplikasi..."
                    className="w-full bg-card border border-border pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-primary mb-3">Kategori</div>
                <div className="space-y-1.5">
                  {[{ key: "all", label: `Semua (${products.length})` }, ...(categories as { label: string }[]).map((c) => ({
                    key: c.label, label: `${c.label} (${products.filter((p) => p.category === c.label).length})`,
                  }))].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCat(c.key)}
                      className={`w-full text-left text-sm px-3 py-2 border transition ${cat === c.key ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-primary mb-3">Brand</div>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-card border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="all">Semua Brand</option>
                  {allBrands.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-primary mb-3">Ketersediaan</div>
                <div className="space-y-1.5">
                  {[
                    { value: "all", label: "Semua" },
                    { value: "Ready", label: "Ready Stock" },
                    { value: "Indent", label: "Indent" },
                    { value: "Pre-Order", label: "Pre-Order" },
                  ].map((s) => (
                    <label key={s.value} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="radio" name="stock" checked={stock === s.value} onChange={() => setStock(s.value)} className="accent-primary" />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={reset} className="w-full border border-border px-4 py-2.5 text-sm uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition">
                Reset Filter
              </button>
            </aside>

            {/* Product Grid */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
                <div className="text-sm text-muted-foreground">
                  Menampilkan <span className="text-foreground font-semibold">{filtered.length}</span> dari {products.length} produk
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Urutkan:</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-card border border-border px-3 py-1.5 text-sm focus:outline-none focus:border-primary">
                    <option value="name">Nama</option>
                    <option value="brand">Brand</option>
                    <option value="category">Kategori</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="border border-dashed border-border p-16 text-center">
                  <div className="font-display text-2xl uppercase mb-2">Produk tidak ditemukan</div>
                  <p className="text-sm text-muted-foreground mb-6">Coba ubah kata kunci atau reset filter Anda.</p>
                  <button onClick={reset} className="bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-semibold">Reset Filter</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((p) => (
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
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-3">
                          <span>{p.category_label}</span><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{p.brand}</span>
                        </div>
                        <h3 className="font-display text-xl uppercase mb-2 group-hover:text-primary transition">{p.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
