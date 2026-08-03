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
    <section className="py-28 section-alt border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Alur Kerja</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Dari Permintaan<br /><span className="text-gradient-orange">Hingga Operasi</span>
          </h2>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-border" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="w-16 h-16 bg-background border border-primary flex items-center justify-center font-display text-xl text-primary mb-4 relative z-10">
                  {s.n}
                </div>
                <div className="font-display text-lg uppercase mb-1">{s.t}</div>
                <div className="text-sm text-muted-foreground">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
