import { useScrollAnimate } from "@/hooks/use-scroll-animate";

const items = [
  { i: "01", t: "Keahlian Teknis", d: "Tim engineering berpengalaman dengan pemahaman industri mendalam." },
  { i: "02", t: "Pengadaan Cepat", d: "Sistem sourcing efisien dengan jaringan supplier yang kuat." },
  { i: "03", t: "Produk Original", d: "Produk asli bersertifikat dari brand resmi terpercaya." },
  { i: "04", t: "Pengiriman Nasional", d: "Cakupan ke seluruh wilayah utama di Indonesia." },
  { i: "05", t: "Dukungan After Sales", d: "Layanan maintenance teknis dan support berkelanjutan." },
  { i: "06", t: "Harga Kompetitif", d: "Solusi biaya efisien tanpa mengorbankan kualitas." },
];

export function WhyUs() {
  const containerRef = useScrollAnimate();

  return (
    <section className="py-28 section-ember border-y border-border" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-14" data-animate="fade-up">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Mengapa Kami</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Dibangun Untuk<br /><span className="text-gradient-orange">Performa Industri</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-animate-stagger>
          {items.map((it) => (
            <div key={it.i} className="industrial-card p-7 group">
              <div className="flex items-start justify-between mb-5">
                <div className="font-display text-5xl text-primary/30 group-hover:text-primary transition-colors">{it.i}</div>
                <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </div>
              </div>
              <h3 className="font-display text-xl uppercase mb-2">{it.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
