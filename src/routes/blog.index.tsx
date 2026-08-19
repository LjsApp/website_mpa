import { LazyImage } from "@/components/ui/lazy-image";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { listArticles, listArticleCategories } from "@/lib/public.functions";
import { asStringList, formatDateID, type ArticleRow } from "@/lib/site-types";

const articlesQuery = queryOptions({
  queryKey: ["articles-public"],
  queryFn: () => listArticles(),
});

const articleCategoriesQuery = queryOptions({
  queryKey: ["article-categories-public"],
  queryFn: () => listArticleCategories(),
});

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog" },
      {
        name: "description",
        content:
          "Wawasan, tips, dan berita seputar industri, otomasi, energi, dan manufaktur dari tim kami.",
      },
      { property: "og:title", content: "Blog & Artikel" },
      {
        property: "og:description",
        content: "Wawasan industri, otomasi, energi, dan manufaktur.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(articlesQuery),
      context.queryClient.ensureQueryData(articleCategoriesQuery),
    ]),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <p className="text-muted-foreground">Gagal memuat artikel: {error.message}</p>
    </div>
  ),
  component: BlogPage,
});

function BlogPage() {
  const { data: sorted } = useSuspenseQuery(articlesQuery);
  const { data: categoryRows } = useSuspenseQuery(articleCategoriesQuery);
  const [cat, setCat] = useState<string>("Semua");
  const [q, setQ] = useState("");
  const categories = useMemo(
    () => ["Semua", ...(categoryRows as { name: string }[]).map((c) => c.name)],
    [categoryRows],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return sorted.filter((a) => {
      if (cat !== "Semua" && a.category !== cat) return false;
      if (!query) return true;
      return (
        a.title.toLowerCase().includes(query) ||
        (a.excerpt ?? "").toLowerCase().includes(query) ||
        asStringList(a.tags).some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [sorted, cat, q]);

  const [featured, ...rest] = filtered;
  const side = rest.slice(0, 2);
  const grid = rest.slice(2);
  const popular = sorted.slice(0, 5);
  const allTags = Array.from(new Set(sorted.flatMap((a) => asStringList(a.tags)))).slice(0, 12);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">
        {/* Page header */}
        <section className="border-b border-border bg-card/30">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex flex-col-reverse md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Pusat Wawasan</div>
                    <h1 className="font-display text-3xl md:text-5xl uppercase leading-tight">
                      Blog & <span className="text-gradient-orange">Artikel</span>
                    </h1>
                  </div>
                  <nav className="text-[10px] uppercase tracking-widest text-muted-foreground self-start md:hidden mb-1">
                    <Link to="/" className="hover:text-primary">Beranda</Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">Blog</span>
                  </nav>
                </div>
                <p className="text-muted-foreground mt-3 max-w-xl">
                  Wawasan, panduan teknis, dan berita terbaru seputar industri, otomasi, energi,
                  dan manufaktur dari tim kami.
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <nav className="text-xs uppercase tracking-widest text-muted-foreground hidden md:block">
                  <Link to="/" className="hover:text-primary">Beranda</Link>
                  <span className="mx-2">/</span>
                  <span className="text-foreground">Blog</span>
                </nav>
                <div className="relative w-full md:w-80">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari artikel, topik, tag…"
                    className="w-full bg-background border border-border px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Category bar */}
          <div className="border-t border-border">
            <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-4 py-3 text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition ${
                    cat === c
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured + side */}
        {featured && (
          <section className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-6">
            <FeaturedCard article={featured} />
            <div className="flex flex-col gap-6">
              {side.map((a) => (
                <SideCard key={a.id} article={a} />
              ))}
              {side.length === 0 && (
                <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Belum ada artikel pendamping di kategori ini.
                </div>
              )}
            </div>
          </section>
        )}

        {/* Main grid + sidebar */}
        <section className="max-w-7xl mx-auto px-6 pb-20 grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
              <h2 className="font-display text-2xl uppercase">
                {cat === "Semua" ? "Artikel Terbaru" : cat}
              </h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {filtered.length} artikel
              </span>
            </div>
            {grid.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
                Tidak ada artikel tambahan untuk filter ini.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {grid.map((a) => (
                  <GridCard key={a.id} article={a} />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="border border-border bg-card/30 p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Terpopuler</div>
              <ol className="space-y-4">
                {popular.map((a, i) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="font-display text-2xl text-primary leading-none w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: a.slug }}
                      className="text-sm leading-snug hover:text-primary transition line-clamp-3"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-border bg-card/30 p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Topik</div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setQ(t)}
                    className="text-xs px-3 py-1.5 border border-border hover:border-primary hover:text-primary transition uppercase tracking-wider"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CategoryPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] px-2 py-1 font-semibold">
      {children}
    </span>
  );
}

const IG_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

function FeaturedCard({ article }: { article: ArticleRow }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: article.slug }}
      className="lg:col-span-2 group relative block overflow-hidden border border-border bg-card"
    >
      <div className="aspect-[16/10] overflow-hidden">
        {article.image_url && <LazyImage
          src={article.image_url}
          alt={article.title}
          width={1280}
          height={768}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <CategoryPill>{article.category}</CategoryPill>
          {article.source === "instagram" && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#E1306C] bg-[#E1306C]/10 px-2 py-1 font-semibold rounded">
              {IG_ICON} Instagram
            </span>
          )}
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            {formatDateID(article.published_at)}
          </span>
        </div>
        <h3 className="font-display text-2xl md:text-3xl uppercase leading-tight group-hover:text-primary transition">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2 max-w-2xl">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}

function SideCard({ article }: { article: ArticleRow }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: article.slug }}
      className="group grid grid-cols-[140px_1fr] gap-4 border border-border bg-card/40 hover:border-primary transition"
    >
      <div className="aspect-square overflow-hidden">
        {article.image_url && <LazyImage
          src={article.image_url}
          alt={article.title}
          width={280}
          height={280}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />}
      </div>
      <div className="py-3 pr-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryPill>{article.category}</CategoryPill>
          {article.source === "instagram" && (
            <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#E1306C] bg-[#E1306C]/10 px-1.5 py-0.5 font-semibold rounded">
              {IG_ICON} IG
            </span>
          )}
        </div>
        <h4 className="font-display text-sm md:text-base uppercase mt-2 leading-snug group-hover:text-primary transition line-clamp-3">
          {article.title}
        </h4>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-2">
          {formatDateID(article.published_at)}
        </div>
      </div>
    </Link>
  );
}

function GridCard({ article }: { article: ArticleRow }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: article.slug }}
      className="group flex flex-col border border-border bg-card/30 hover:border-primary transition"
    >
      <div className="aspect-[16/10] overflow-hidden">
        {article.image_url && <LazyImage
          src={article.image_url}
          alt={article.title}
          width={640}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <CategoryPill>{article.category}</CategoryPill>
          {article.source === "instagram" && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#E1306C] bg-[#E1306C]/10 px-2 py-1 font-semibold rounded">
              {IG_ICON} Instagram
            </span>
          )}
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {formatDateID(article.published_at)}
          </span>
        </div>
        <h4 className="font-display text-lg uppercase leading-tight group-hover:text-primary transition line-clamp-2">
          {article.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
        <div className="mt-auto text-xs uppercase tracking-widest text-primary">
          Baca Artikel →
        </div>
      </div>
    </Link>
  );
}
