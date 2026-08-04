import { LazyImage } from "@/components/ui/lazy-image";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listProjects, listProjectCategories } from "@/lib/public.functions";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";

const projectsQuery = queryOptions({
  queryKey: ["projects-public"],
  queryFn: () => listProjects(),
});

const projectCategoriesQuery = queryOptions({
  queryKey: ["project-categories-public"],
  queryFn: () => listProjectCategories(),
});

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Proyek" },
      { name: "description", content: "Daftar lengkap proyek otomasi, instalasi, dan maintenance industri yang telah kami kerjakan." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectsQuery),
      context.queryClient.ensureQueryData(projectCategoriesQuery),
    ]),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <p className="text-muted-foreground">Gagal memuat proyek: {error.message}</p>
    </div>
  ),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const { data: categoryRows } = useSuspenseQuery(projectCategoriesQuery);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const categories = useMemo(
    () => (categoryRows as { name: string }[]).map((c) => c.name),
    [categoryRows],
  );
  const years = useMemo(() => Array.from(new Set(projects.map((p) => p.year).filter(Boolean))) as string[], [projects]);

  const filtered = projects.filter((p) => {
    if (cat !== "all" && p.category !== cat) return false;
    if (year !== "all" && p.year !== year) return false;
    if (status !== "all" && p.status !== status) return false;
    if (q && !p.title.toLowerCase().includes(q.toLowerCase()) && !(p.location ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Portofolio</div>
                <h1 className="font-display text-4xl md:text-5xl uppercase">Semua Proyek Kami</h1>
              </div>
              <nav className="text-xs uppercase tracking-widest text-muted-foreground shrink-0 mt-1">
                <Link to="/" className="hover:text-primary">Beranda</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">Proyek</span>
              </nav>
            </div>
            <p className="text-muted-foreground mt-3 max-w-2xl">Telusuri portofolio proyek industri yang telah kami selesaikan di berbagai sektor.</p>
          </div>

          <div className="flex gap-3 mb-10 p-4 border border-border bg-card/50 overflow-x-auto">
            <Input placeholder="Cari proyek..." value={q} onChange={(e) => setQ(e.target.value)} className="min-w-[160px] flex-1" />
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-background border border-border px-3 text-sm h-9 shrink-0 min-w-[130px]">
              <option value="all">Semua Kategori</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-background border border-border px-3 text-sm h-9 shrink-0 min-w-[110px]">
              <option value="all">Semua Tahun</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-background border border-border px-3 text-sm h-9 shrink-0 min-w-[120px]">
              <option value="all">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Berjalan">Berjalan</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">Tidak ada proyek yang cocok.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Link key={p.id} to="/projects/$slug" params={{ slug: p.slug }} className="industrial-card overflow-hidden group">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {Array.isArray((p as any).gallery) && (p as any).gallery[0] && <LazyImage src={(p as any).gallery[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-3">
                      <span>{p.category}</span><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{p.year}</span>
                    </div>
                    <h3 className="font-display text-xl uppercase mb-2">{p.title}</h3>
                    <div className="text-sm text-muted-foreground">{p.location}</div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary border border-primary/40 px-3 py-1.5">
                      <span className="w-1.5 h-1.5 bg-primary" /> {p.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}