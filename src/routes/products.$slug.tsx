import { LazyImage } from "@/components/ui/lazy-image";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getProductBySlug } from "@/lib/public.functions";
import { asSpecs, asStringList } from "@/lib/site-types";
import { DocumentDownloads } from "@/components/site/DocumentDownloads";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!data?.product) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) return { meta: [{ title: "Produk" }] };
    const siteUrl = import.meta.env.VITE_SITE_URL ?? "";
    const canonicalUrl = `${siteUrl}/products/${product.slug}`;
    const desc = product.description
      ? product.description.slice(0, 160)
      : `${product.name} — ${product.category_label ?? product.category}. Produk industrial berkualitas.`;
    return {
      meta: [
        { title: product.name },
        { name: "description", content: desc },
        { name: "keywords", content: `${product.name}, ${product.brand ?? ""}, ${product.category_label ?? product.category}, industrial supply` },
        { property: "og:title", content: product.name },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        ...(product.image_url ? [{ property: "og:image", content: product.image_url }] : []),
        ...(siteUrl ? [{ property: "og:url", content: canonicalUrl }] : []),
        { name: "twitter:title", content: product.name },
        { name: "twitter:description", content: desc },
        ...(product.image_url ? [{ name: "twitter:image", content: product.image_url }] : []),
      ],
      links: siteUrl ? [{ rel: "canonical", href: canonicalUrl }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="font-display text-6xl uppercase mb-3">404</div>
          <p className="text-muted-foreground mb-8">Produk yang Anda cari tidak ditemukan.</p>
          <Link to="/catalog" className="bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-semibold">
            Kembali ke Katalog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Link to="/catalog" className="text-primary underline">Kembali ke Katalog</Link>
      </div>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const product = data.product!;
  const related = data.related;
  const specs = asSpecs(product.specs);
  const features = asStringList(product.features);
  const applications = asStringList(product.applications);
  const gallery = Array.isArray((product as any).gallery) ? ((product as any).gallery as string[]) : [];
  const [activeImage, setActiveImage] = useState<string | null>(gallery[0] ?? null);
  const waText = encodeURIComponent(`Halo, saya tertarik dengan produk ${product.name} (${product.brand}). Mohon info lebih lanjut.`);
  const siteUrl = import.meta.env.VITE_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description ?? undefined,
    "brand": product.brand ? { "@type": "Brand", "name": product.brand } : undefined,
    "category": product.category_label ?? product.category,
    "image": product.image_url ?? undefined,
    ...(siteUrl ? { "url": `${siteUrl}/products/${product.slug}` } : {}),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="pt-24">
        <section className="border-b border-border bg-card/30 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="text-xs uppercase tracking-widest text-muted-foreground">
              <Link to="/" className="hover:text-primary">Beranda</Link>
              <span className="mx-2">/</span>
              <Link to="/catalog" className="hover:text-primary">Katalog</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{product.category_label}</span>
            </nav>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10">
            <div>
              <div className="aspect-square overflow-hidden border border-border bg-card relative">
                {activeImage && <LazyImage src={activeImage} alt={product.name} eager width={1024} height={1024} className="w-full h-full object-cover" />}
                <div className="absolute top-4 left-4 bg-background/85 backdrop-blur border border-border px-3 py-1.5 text-xs uppercase tracking-widest">
                  {product.stock}
                </div>
              </div>
              {/* Thumbnail strip */}
              {gallery.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {gallery.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`shrink-0 w-16 h-16 border overflow-hidden cursor-pointer ${
                        activeImage === img ? "border-primary opacity-100" : "border-border opacity-60 hover:opacity-100 hover:border-primary/60"
                      }`}
                    >
                      <LazyImage src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">{product.category_label}</div>
              <h1 className="font-display text-3xl md:text-4xl uppercase leading-tight mb-4 break-words">{product.name}</h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="border border-primary/40 text-primary px-3 py-1 text-xs uppercase tracking-widest">{product.brand}</span>
                {(product as any).sku && (
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">SKU: {(product as any).sku}</span>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-8 break-words whitespace-pre-line">{product.description}</p>


              {features.length > 0 && (
                <div className="border-t border-border pt-6 mb-6">
                  <div className="text-xs uppercase tracking-widest text-primary mb-3">Fitur Utama</div>
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm break-words">
                        <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        <span className="text-muted-foreground break-words min-w-0 flex-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <a href={`https://wa.me/6281200000000?text=${waText}`} className="bg-primary text-primary-foreground px-7 py-3.5 font-semibold uppercase tracking-wider text-sm hover:brightness-110 transition glow-orange inline-flex items-center gap-2">
                  Minta Penawaran
                </a>
                <a href="mailto:info@morganpowerindo.com" className="border border-border px-7 py-3.5 font-semibold uppercase tracking-wider text-sm hover:bg-card transition">
                  Email Sales
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* Specs & Applications */}
        <section className="py-12 bg-card/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-10">
            <div className="min-w-0 lg:col-span-2">
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Spesifikasi Teknis</div>
              <h2 className="font-display text-3xl uppercase mb-6">Detail Spesifikasi</h2>
              <div className="border border-border bg-background overflow-x-auto">
                <table className="w-full table-fixed">
                  <tbody>
                    {specs.map((s, idx) => (
                      <tr key={s.label} className={idx % 2 === 0 ? "bg-card/40" : ""}>
                        <td className="py-3 px-4 sm:px-5 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider w-1/2 border-b border-border break-words">{s.label}</td>
                        <td className="py-3 px-4 sm:px-5 text-xs sm:text-sm font-semibold border-b border-border break-words">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8">
                <DocumentDownloads value={(product as any).documents} title="Dokumen Produk" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Aplikasi</div>
              <h2 className="font-display text-3xl uppercase mb-6">Penggunaan</h2>
              <div className="space-y-2">
                {applications.map((a) => (
                  <div key={a} className="border border-border bg-background px-4 py-3 text-sm flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-primary" />
                    {a}
                  </div>
                ))}
              </div>
              <div className="mt-8 industrial-card p-6">
                <div className="text-xs uppercase tracking-widest text-primary mb-2">Butuh Konsultasi?</div>
                <p className="text-sm text-muted-foreground mb-4">Tim engineer kami siap membantu pemilihan produk yang tepat untuk aplikasi Anda.</p>
                <a href={`https://wa.me/6281200000000?text=${waText}`} className="text-sm uppercase tracking-widest text-primary hover:underline">
                  Hubungi via WhatsApp →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-wrap items-end justify-between mb-10 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Produk Terkait</div>
                  <h2 className="font-display text-3xl md:text-4xl uppercase leading-tight">
                    Produk Lain Dari<br /><span className="text-gradient-orange">{product.category_label}</span>
                  </h2>
                </div>
                <Link to="/catalog" className="text-sm uppercase tracking-widest text-primary hover:underline">
                  Lihat Semua →
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((r) => (
                  <Link key={r.id} to="/products/$slug" params={{ slug: r.slug }} className="industrial-card overflow-hidden group">
                    <div className="aspect-[4/3] overflow-hidden bg-background">
                      {Array.isArray((r as any).gallery) && (r as any).gallery[0] && <LazyImage src={(r as any).gallery[0]} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />}
                    </div>
                    <div className="p-5">
                      <div className="text-[10px] uppercase tracking-widest text-primary mb-1.5">{r.brand}</div>
                      <div className="font-display text-base uppercase leading-tight mb-2 group-hover:text-primary transition">{r.name}</div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
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
