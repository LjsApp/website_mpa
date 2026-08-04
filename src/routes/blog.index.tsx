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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Pusat Wawasan</div>
                    <h1 className="font-display text-4xl md:text-5xl uppercase leading-none">
                      Blog & <span className="text-gradient-orange">Artikel</span>
                    </h1>
                  </div>
                  <nav className="text-xs uppercase tracking-widest text-muted-foreground shrink-0 mt-1 md:hidden">
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

            <div className="border border-primary/40 bg-background p-5">
              <div className="text-xs uppercase tracking-[0.25em] text-primary mb-2">Newsletter</div>
              <p className="text-sm text-muted-foreground mb-4">
                Dapatkan wawasan industri & tips procurement langsung di inbox Anda.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="email@perusahaan.com"
                  className="bg-card border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <button className="bg-primary text-primary-foreground py-2 text-xs uppercase tracking-widest font-semibold hover:brightness-110 transition">
                  Berlangganan
                </button>
              </form>
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
        <CategoryPill>{article.category}</CategoryPill>
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
        <div className="flex items-center gap-3">
          <CategoryPill>{article.category}</CategoryPill>
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
