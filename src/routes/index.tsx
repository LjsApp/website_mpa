import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getHomeData } from "@/lib/public.functions";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Brands } from "@/components/site/Brands";
import { About } from "@/components/site/About";
import { WhyUs } from "@/components/site/WhyUs";
import { Products } from "@/components/site/Products";
import { Workflow } from "@/components/site/Workflow";
import { Projects } from "@/components/site/Projects";
import { Clients } from "@/components/site/Clients";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

const homeQuery = queryOptions({
  queryKey: ["home-data"],
  queryFn: () => getHomeData(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beranda" },
      { name: "keywords", content: "distributor industrial, filter industri, conveyor, motor listrik, bearing, pompa, komponen teknik, engineering supply Indonesia" },
    ],
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: ({ context }: any) => context.queryClient.ensureQueryData(homeQuery),
  errorComponent: ({ error }: { error: Error }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <p className="text-muted-foreground">Gagal memuat konten: {error.message}</p>
    </div>
  ),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQuery);
  const c = data.company;
  const siteUrl = import.meta.env.VITE_SITE_URL ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": c?.name ?? "",
    "description": c?.about ?? "",
    "url": siteUrl || undefined,
    "logo": c?.logo_url ?? undefined,
    "email": c?.email ?? undefined,
    "address": c?.address ? {
      "@type": "PostalAddress",
      "streetAddress": c.address,
    } : undefined,
    "sameAs": [
      c?.linkedin_url,
      c?.instagram_url,
      c?.facebook_url,
      c?.youtube_url,
    ].filter(Boolean),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main>
        <Hero company={data.company} />
        <About company={data.company} />
        <WhyUs />
        <Products products={data.products} />
        <Workflow />
        <Brands brands={data.brands} company={data.company} />
        <Projects projects={data.projects} />
        <Clients clients={data.clients} company={data.company} />
        <Testimonials items={data.testimonials} />
        <Contact company={data.company} />
        <Footer company={data.company} />
      </main>
    </div>
  );
}
