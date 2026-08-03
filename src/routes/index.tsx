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
  head: () => ({ meta: [{ title: "Beranda" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <p className="text-muted-foreground">Gagal memuat konten: {error.message}</p>
    </div>
  ),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQuery);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero company={data.company} />
        <About company={data.company} />
        <WhyUs />
        <Products products={data.products} />
        <Workflow />
        <Brands brands={data.brands} />
        <Projects projects={data.projects} />
        <Clients clients={data.clients} />
        <Testimonials items={data.testimonials} />
        <Contact company={data.company} />
        <Footer company={data.company} />
      </main>
    </div>
  );
}
