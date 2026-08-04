const steps = [
  { n: "01", t: "Konsultasi", d: "Memahami kebutuhan operasional Anda." },
  { n: "02", t: "Analisis Kebutuhan", d: "Lingkup teknis & spesifikasi." },
  { n: "03", t: "Pengadaan", d: "Sourcing komponen original." },
  { n: "04", t: "Instalasi", d: "Eksekusi engineering di lokasi." },
  { n: "05", t: "Testing", d: "Commissioning & kontrol kualitas." },
  { n: "06", t: "Dukungan", d: "After-sales & maintenance." },
];

export function Workflow() {
  return (
    <section className="py-28 bg-primary border-y border-primary/20 relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.15) 39px, rgba(255,255,255,0.15) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.15) 39px, rgba(255,255,255,0.15) 40px)"
      }} />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-primary-foreground/60 mb-3">Alur Kerja</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight text-primary-foreground">
            Dari Permintaan<br /><span className="text-primary-foreground/80">Hingga Operasi</span>
          </h2>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-primary-foreground/20" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative group">
                <div className="w-16 h-16 bg-primary-foreground/10 border border-primary-foreground/40 group-hover:bg-primary-foreground/20 group-hover:border-primary-foreground transition-all duration-300 flex items-center justify-center font-display text-xl text-primary-foreground mb-4 relative z-10">
                  {s.n}
                </div>
                <div className="font-display text-lg uppercase mb-1 text-primary-foreground">{s.t}</div>
                <div className="text-sm text-primary-foreground/70">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
