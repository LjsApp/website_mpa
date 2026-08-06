import { LazyImage } from "@/components/ui/lazy-image";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getArticleBySlug } from "@/lib/public.functions";
import { asStringList, asHtmlContent, formatDateID } from "@/lib/site-types";
import { useCompanyState, socialLinks } from "@/hooks/use-company";

const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!data?.article) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) return { meta: [{ title: "Artikel" }] };
    const siteUrl = import.meta.env.VITE_SITE_URL ?? "";
    const canonicalUrl = `${siteUrl}/blog/${article.slug}`;
    return {
      meta: [
        { title: article.title },
        { name: "description", content: article.excerpt ?? article.title },
        { name: "keywords", content: `${article.category}, artikel industri, teknik, engineering` },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt ?? article.title },
        { property: "og:type", content: "article" },
        ...(article.image_url ? [{ property: "og:image", content: article.image_url }] : []),
        ...(siteUrl ? [{ property: "og:url", content: canonicalUrl }] : []),
        { property: "article:published_time", content: article.published_at ?? "" },
        { property: "article:section", content: article.category ?? "" },
        { name: "twitter:title", content: article.title },
        { name: "twitter:description", content: article.excerpt ?? article.title },
        ...(article.image_url ? [{ name: "twitter:image", content: article.image_url }] : []),
      ],
      links: siteUrl ? [{ rel: "canonical", href: canonicalUrl }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-32 pb-20 text-center px-6">
        <div className="font-display text-6xl uppercase mb-3">404</div>
        <p className="text-muted-foreground mb-8">Artikel tidak ditemukan.</p>
        <Link to="/blog" className="bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-semibold">
          Kembali ke Blog
        </Link>
      </main>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Link to="/blog" className="text-primary underline">Kembali ke Blog</Link>
      </div>
    </div>
  ),
  component: ArticleDetail,
});

function ArticleDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(articleQuery(slug));
  const article = data.article!;
  const related = data.related;
  const content = asHtmlContent(article.content);
  const tags = asStringList(article.tags);
  const { company } = useCompanyState();
  const socials = socialLinks(company);

  const siteUrl = import.meta.env.VITE_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt ?? article.title,
    "image": article.image_url ?? undefined,
    "datePublished": article.published_at ?? undefined,
    "author": { "@type": "Organization", "name": company?.name ?? "Tim" },
    "publisher": {
      "@type": "Organization",
      "name": company?.name ?? "",
      "logo": company?.logo_url ? { "@type": "ImageObject", "url": company.logo_url } : undefined,
    },
    ...(siteUrl ? { "url": `${siteUrl}/blog/${article.slug}` } : {}),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="pt-24">
        {/* Breadcrumb bar */}
        <div className="border-b border-border bg-card/30">
          <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] px-2 py-1 font-semibold">{article.category}</span>
            </div>
            <nav className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">
              <Link to="/" className="hover:text-primary">Beranda</Link>
              <span className="mx-2">/</span>
              <Link to="/blog" className="hover:text-primary">Blog</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{article.category}</span>
            </nav>
          </div>
        </div>


        {/* Article header */}
        <article className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="font-display text-3xl md:text-5xl uppercase leading-tight mb-6">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 border-y border-border py-4 mb-10">
            {/* Company logo or initials */}
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.name ?? ""} className="h-8 w-auto max-w-[80px] object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-xs font-display">
                {(company?.name ?? "T").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold">Tim</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">
                {formatDateID(article.published_at)}
              </div>
            </div>
            {socials.length > 0 && (
              <div className="ml-auto flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 border border-border flex items-center justify-center text-xs uppercase text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
                  >
                    {s.key}
                  </a>
                ))}
              </div>
            )}
          </div>

          {article.image_url && (
            <figure className="mb-10">
              <LazyImage
                src={article.image_url}
                alt={article.title}
                width={1280}
                height={768}
                className="w-full aspect-[16/9] object-cover border border-border"
              />
            </figure>
          )}

          <div
            className="prose-content space-y-5 text-[17px] leading-[1.85] text-foreground/90 text-justify"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Tag:</span>
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1.5 border border-border uppercase tracking-wider text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="bg-card/30 border-t border-border py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Artikel Terkait</div>
                  <h2 className="font-display text-2xl md:text-3xl uppercase">Lebih banyak dari {article.category}</h2>
                </div>
                <Link to="/blog" className="text-sm uppercase tracking-widest text-primary link-slide inline-block mt-2 md:mt-0">
                  Lihat Semua Artikel <span className="arrow">→</span>
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((a) => (
                  <Link
                    key={a.id}
                    to="/blog/$slug"
                    params={{ slug: a.slug }}
                    className="group flex flex-col border border-border bg-background hover:border-primary transition"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      {a.image_url && <LazyImage
                        src={a.image_url}
                        alt={a.title}
                        width={640}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />}
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                        {formatDateID(a.published_at)}
                      </div>
                      <h4 className="font-display text-base uppercase leading-tight group-hover:text-primary transition line-clamp-2">
                        {a.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
