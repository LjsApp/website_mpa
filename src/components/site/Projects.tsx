import { LazyImage } from "@/components/ui/lazy-image";
import { Link } from "@tanstack/react-router";
import type { ProjectRow } from "@/lib/site-types";

export function Projects({ projects = [] }: { projects?: ProjectRow[] }) {
  if (projects.length === 0) return null;
  return (
    <section id="projects" className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Pengalaman Proyek</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Proyek Terbaru<br /><span className="text-gradient-orange">Berhasil Diselesaikan</span>
            </h2>
          </div>
          <Link to="/projects" className="text-sm uppercase tracking-widest text-primary hover:underline">
            Lihat Semua Proyek →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link key={p.id} to="/projects/$slug" params={{ slug: p.slug }} className="industrial-card overflow-hidden group">
              <div className="aspect-[4/3] overflow-hidden">
                {Array.isArray((p as any).gallery) && (p as any).gallery[0] && <LazyImage src={(p as any).gallery[0]} alt={p.title} width={1024} height={768} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-3">
                  <span>{p.category}</span><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{p.year}</span>
                </div>
                <h3 className="font-display text-xl uppercase mb-2">{p.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {p.location}
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary border border-primary/40 px-3 py-1.5">
                  <span className="w-1.5 h-1.5 bg-primary" /> {p.status}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
