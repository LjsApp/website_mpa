import { useState } from "react";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";
import { asWhyUsItems, type ClientRow, type CompanyRow } from "@/lib/site-types";
import { DeliveryMap, type DeliveryLocation } from "./DeliveryMap";
import { WhyUsModal } from "./WhyUsModal";

const ICON_MAP: Record<string, React.ReactNode> = {
  "01": <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  "02": <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  "03": <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  "04": <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  "05": <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  "06": <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
};

export function WhyUs({ clients, company }: { clients?: ClientRow[], company?: CompanyRow }) {
  const containerRef = useScrollAnimate();
  const [mapOpen, setMapOpen] = useState(false);
  const [modalItemIdx, setModalItemIdx] = useState<number | null>(null);
  
  const deliveryLocations: DeliveryLocation[] = (clients || [])
    .filter(c => c.address && c.lat && c.lng)
    .map(c => ({
      name: c.name,
      address: c.address as string,
      lat: c.lat as number,
      lng: c.lng as number,
      pinIcon: c.pin_icon ?? "default",
    }));

  const items = asWhyUsItems(company?.why_us);
  const modalItem = modalItemIdx !== null ? items[modalItemIdx] : null;

  return (
    <>
      <section className="py-16 md:py-20 section-ember border-y border-border" ref={containerRef as any}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14" data-animate="fade-up">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Mengapa Kami</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Dibangun Untuk<br /><span className="text-gradient-orange">Performa Industri</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-animate-stagger>
            {items.map((it, idx) => {
              const isDelivery = it.i === "04";
              return (
                <button 
                  key={it.i} 
                  className="industrial-card p-7 group text-left cursor-pointer ring-1 ring-transparent hover:ring-primary/30 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
                  onClick={() => isDelivery ? setMapOpen(true) : setModalItemIdx(idx)}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="font-display text-5xl text-primary/30 group-hover:text-primary transition-colors">{it.i}</div>
                    <div className="w-10 h-10 border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition">
                      <div className="text-muted-foreground group-hover:text-white transition-colors">
                        {ICON_MAP[it.i] || <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-display text-xl uppercase mb-2">{it.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{it.d}</p>
                  
                  {isDelivery ? (
                    deliveryLocations.length > 0 && (
                      <div className="mt-4 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        Lihat Jangkauan ({deliveryLocations.length} Kota) <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    )
                  ) : (
                    <div className="mt-4 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Pelajari Lebih Lanjut <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  )}
                </button>
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

      {modalItem && (
        <WhyUsModal 
          item={modalItem} 
          icon={ICON_MAP[modalItem.i] || <></>}
          isOpen={modalItemIdx !== null}
          onClose={() => setModalItemIdx(null)}
        />
      )}
    </>
  );
}
