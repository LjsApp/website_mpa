import { useState } from "react";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";
import type { ClientRow } from "@/lib/site-types";
import { DeliveryMap, type DeliveryLocation } from "./DeliveryMap";

const items = [
  { i: "01", t: "Keahlian Teknis", d: "Tim engineering berpengalaman dengan pemahaman industri mendalam." },
  { i: "02", t: "Pengadaan Cepat", d: "Sistem sourcing efisien dengan jaringan supplier yang kuat." },
  { i: "03", t: "Produk Original", d: "Produk asli bersertifikat dari brand resmi terpercaya." },
  { i: "04", t: "Pengiriman Nasional", d: "Cakupan ke seluruh wilayah utama di Indonesia." },
  { i: "05", t: "Dukungan After Sales", d: "Layanan maintenance teknis dan support berkelanjutan." },
  { i: "06", t: "Harga Kompetitif", d: "Solusi biaya efisien tanpa mengorbankan kualitas." },
];

export function WhyUs({ clients }: { clients?: ClientRow[] }) {
  const containerRef = useScrollAnimate();
  const [mapOpen, setMapOpen] = useState(false);
  
  const deliveryLocations: DeliveryLocation[] = (clients || [])
    .filter(c => c.address && c.lat && c.lng)
    .map(c => ({
      name: c.name,
      address: c.address as string,
      lat: c.lat as number,
      lng: c.lng as number,
      pinIcon: c.pin_icon ?? "default",
    }));

  return (
    <>
      <section className="py-28 section-ember border-y border-border" ref={containerRef as any}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14" data-animate="fade-up">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Mengapa Kami</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Dibangun Untuk<br /><span className="text-gradient-orange">Performa Industri</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-animate-stagger>
            {items.map((it) => {
              const isDelivery = it.i === "04";
              const Wrapper = isDelivery ? "button" : "div";
              return (
                <Wrapper 
                  key={it.i} 
                  className={`industrial-card p-7 group text-left ${isDelivery ? "cursor-pointer ring-1 ring-transparent hover:ring-primary/30 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md" : ""}`}
                  onClick={isDelivery ? () => setMapOpen(true) : undefined}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="font-display text-5xl text-primary/30 group-hover:text-primary transition-colors">{it.i}</div>
                    <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition">
                      {isDelivery ? (
                        <svg className="w-5 h-5 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      ) : (
                        <svg className="w-5 h-5 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                      )}
                    </div>
                  </div>
                  <h3 className="font-display text-xl uppercase mb-2">{it.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{it.d}</p>
                  
                  {isDelivery && deliveryLocations.length > 0 && (
                    <div className="mt-4 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      Lihat Jangkauan ({deliveryLocations.length} Kota) <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  )}
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>

      {mapOpen && (
        <DeliveryMap 
          isOpen={mapOpen} 
          onClose={() => setMapOpen(false)} 
          locations={deliveryLocations} 
        />
      )}
    </>
  );
}
