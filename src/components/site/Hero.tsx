import heroImg from "@/assets/hero-industrial.jpg";
import { asStats, type CompanyRow } from "@/lib/site-types";

const badges = ["Mitra Terpercaya", "Pengadaan Cepat", "Layanan Nasional", "Dukungan Teknis"];
const fallbackStats = [
  { value: "10+", label: "Tahun Pengalaman" },
  { value: "150+", label: "Proyek Selesai" },
  { value: "80+", label: "Klien Aktif" },
  { value: "24/7", label: "Dukungan" },
];

export function Hero({ company }: { company?: CompanyRow | null }) {
  const dbStats = asStats(company?.stats);
  const stats = dbStats.length > 0 ? dbStats.slice(0, 4) : fallbackStats;
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/70" />
      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-6">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            Supply Industri & Engineering
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] uppercase font-bold">
            Solusi Industrial<br />
            <span className="text-gradient-orange">Supply & Engineering</span><br />
            Terintegrasi
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Menghadirkan solusi engineering, industrial supply, maintenance, reliability, serta teknologi digital untuk membantu industri bekerja lebih andal, efisien, dan berkelanjutan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-primary text-primary-foreground px-7 py-3.5 font-semibold uppercase tracking-wider text-sm hover:brightness-110 transition glow-orange"
            >
              Minta Penawaran
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="border border-border px-7 py-3.5 font-semibold uppercase tracking-wider text-sm hover:bg-card transition"
            >
              Jelajahi Produk
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {badges.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {b}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative aspect-[4/5] overflow-hidden border border-border">
            <img src={heroImg} alt="Operasi engineering industri" width={1536} height={1024} className="w-full h-full object-cover object-[75%_center]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`py-6 px-4 ${i < 3 ? "md:border-r border-border" : ""} ${i < 2 ? "border-r md:border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}>
              <div className="font-display text-3xl md:text-4xl text-primary">{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
