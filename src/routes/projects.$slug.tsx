import { LazyImage } from "@/components/ui/lazy-image";
import { DocumentDownloads } from "@/components/site/DocumentDownloads";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getProjectBySlug } from "@/lib/public.functions";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { asStringList, asHtmlContent } from "@/lib/site-types";

const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug({ data: { slug } }),
  });

function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24">
        {/* Hero skeleton */}
        <section className="relative h-[40vh] md:h-[55vh] bg-muted animate-pulse" />
        {/* Content skeleton */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute("/projects/$slug")({
  pendingComponent: ProjectDetailSkeleton,
  pendingMs: 0,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(projectQuery(params.slug));
    if (!data?.project) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const project = loaderData?.project;
    if (!project) return { meta: [{ title: `Proyek — ${params.slug}` }] };
    const siteUrl = import.meta.env.VITE_SITE_URL ?? "";
    const canonicalUrl = `${siteUrl}/projects/${project.slug}`;
    const desc = (project as any).excerpt ?? `Proyek ${project.title} oleh tim kami. ${project.category ?? ""}`;
    return {
      meta: [
        { title: project.title },
        { name: "description", content: desc.slice(0, 160) },
        { name: "keywords", content: `${project.title}, proyek industri, ${project.category ?? ""}, engineering` },
        { property: "og:title", content: project.title },
        { property: "og:description", content: desc.slice(0, 160) },
        { property: "og:type", content: "article" },
        ...(project.image_url ? [{ property: "og:image", content: project.image_url }] : []),
        ...(siteUrl ? [{ property: "og:url", content: canonicalUrl }] : []),
      ],
      links: siteUrl ? [{ rel: "canonical", href: canonicalUrl }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center"><Link to="/projects" className="text-primary">← Kembali ke daftar proyek</Link></div>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  const p = data.project!;
  const related = data.related;
  const gallery = asStringList(p.gallery);
  const services = asStringList((p as any).services);
  const content = asHtmlContent((p as any).content);

  const meta: { label: string; value: string | null }[] = [
    { label: "Klien", value: p.client },
    { label: "Lokasi", value: p.location },
    { label: "Tahun", value: p.year },
    { label: "Durasi", value: p.duration },
    { label: "Kategori", value: p.category },
    { label: "Status", value: p.status },
  ];
  const studyBlocks: { label: string; value: string | null }[] = [
    { label: "Tantangan", value: (p as any).challenge ?? null },
    { label: "Solusi", value: (p as any).solution ?? null },
    { label: "Hasil", value: (p as any).result ?? null },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24">

        {/* Breadcrumb bar */}
        <div className="border-b border-border bg-card/30">
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] px-2 py-1 font-semibold">{p.category}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{p.status}</span>
            </div>
            <nav className="text-xs uppercase tracking-widest text-muted-foreground">
              <Link to="/" className="hover:text-primary">Beranda</Link>
              <span className="mx-2">/</span>
              <Link to="/projects" className="hover:text-primary">Proyek</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{p.category}</span>
            </nav>
          </div>
        </div>

        <article className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="font-display text-3xl md:text-5xl uppercase leading-tight mb-6 break-words">{p.title}</h1>
          {p.description && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 whitespace-pre-line break-words">{p.description}</p>
          )}

          {Array.isArray((p as any).gallery) && (p as any).gallery[0] && (
            <figure className="mb-10">
              <LazyImage
                src={(p as any).gallery[0]}
                alt={p.title}
                width={1280}
                height={720}
                className="w-full aspect-[16/9] object-cover border border-border"
              />
            </figure>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border border border-border mb-10">
            {meta.filter((m) => m.value).map((m) => (
              <div key={m.label} className="bg-background p-4">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{m.label}</div>
                <div className="text-sm font-semibold">{m.value}</div>
              </div>
            ))}
          </div>

          {services.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl uppercase mb-4">Lingkup Pekerjaan</h2>
              <div className="flex flex-wrap gap-2">
                {services.map((s, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 border border-border uppercase tracking-wider text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content && (
            <div
              className="prose-content space-y-5 text-[17px] leading-[1.85] text-foreground/90 mb-10"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {studyBlocks.some((b) => b.value) && (
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {studyBlocks.filter((b) => b.value).map((b) => (
                <div key={b.label} className="border border-border p-5 bg-card/40">
                  <div className="text-xs uppercase tracking-widest text-primary mb-2">{b.label}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{b.value}</p>
                </div>
              ))}
            </div>
          )}

          {gallery.length > 0 && (
            <div className="mb-4">
              <h2 className="font-display text-xl uppercase mb-4">Galeri Proyek</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {gallery.map((g, i) => (
                  <LazyImage
                    key={i}
                    src={g}
                    alt={`${p.title} ${i + 1}`}
                    className="w-full aspect-[4/3] object-cover border border-border"
                  />
                ))}
              </div>
            </div>
          )}

          <DocumentDownloads value={(p as any).documents} title="Dokumen Proyek" />
        </article>

        {related.length > 0 && (
          <section className="bg-card/30 border-t border-border py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Proyek Terkait</div>
                  <h2 className="font-display text-2xl md:text-3xl uppercase">Lebih banyak dari {p.category}</h2>
                </div>
                <Link to="/projects" className="text-xs uppercase tracking-widest text-primary hover:underline">
                  Semua Proyek →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to="/projects/$slug"
                    params={{ slug: r.slug }}
                    className="group flex flex-col border border-border bg-background hover:border-primary transition"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      {r.image_url && (
                        <LazyImage
                          src={r.image_url}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                        {r.category} · {r.year}
                      </div>
                      <h4 className="font-display text-base uppercase leading-tight group-hover:text-primary transition line-clamp-2">
                        {r.title}
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