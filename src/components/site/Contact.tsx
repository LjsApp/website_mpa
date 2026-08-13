import { useState, useRef, useEffect } from "react";
import type { CompanyRow } from "@/lib/site-types";
import { mapsEmbedSrc } from "@/hooks/use-company";

export function Contact({ company }: { company?: CompanyRow | null }) {
  const email = company?.email ?? "";
  const address = company?.address ?? "";
  const address_ro = company?.address_ro ?? "";
  const wa = (company?.whatsapp ?? "").replace(/[^0-9]/g, "");
  const wa2 = (company?.whatsapp_2 ?? "").replace(/[^0-9]/g, "");
  const wa3 = (company?.whatsapp_3 ?? "").replace(/[^0-9]/g, "");
  const mapSrc = mapsEmbedSrc(company?.maps_embed);
  const mapSrcRO = mapsEmbedSrc(company?.maps_embed_ro);

  return (
    <section id="contact" className="py-28 bg-card/30 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Hubungi Kami</div>
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-tight">
            Siap Mendukung<br /><span className="text-gradient-orange">Kebutuhan Industri Anda?</span>
          </h2>
          <p className="text-muted-foreground mt-5">
            Diskusikan proyek Anda dengan kami. Tim engineering siap memberikan konsultasi dan penawaran terbaik.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href={`mailto:${email}`} className="bg-primary text-primary-foreground px-8 py-4 font-semibold uppercase tracking-wider text-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 glow-orange">
              Hubungi Kami
            </a>
            {(wa || wa2 || wa3) && <WaDropdown wa={wa} wa2={wa2} wa3={wa3} />}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          <div className="industrial-card p-7">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className="text-xs uppercase tracking-widest text-primary mb-1">Alamat</div>
            <div className="text-sm text-muted-foreground flex flex-col gap-3 mt-3">
              {address && <div><strong className="text-foreground">Head Office (HO):</strong><br/>{address}</div>}
              {address_ro && <div><strong className="text-foreground">Representative Office (RO):</strong><br/>{address_ro}</div>}
            </div>
          </div>
          <div className="industrial-card p-7">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className="text-xs uppercase tracking-widest text-primary mb-1">Kontak</div>
            <div className="text-sm text-muted-foreground flex flex-col gap-1 mt-3">
              {email && <div>{email}</div>}
              {wa && <div>WA 1: {company?.whatsapp}</div>}
              {wa2 && <div>WA 2: {company?.whatsapp_2}</div>}
              {wa3 && <div>WA 3: {company?.whatsapp_3}</div>}
            </div>
          </div>
          <div className="industrial-card p-7">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="text-xs uppercase tracking-widest text-primary mb-1">Jam Operasional</div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {company?.operating_hours ?? "Senin — Jumat · 08:00 – 17:00\nDukungan Darurat 24/7"}
            </div>
          </div>
        </div>

        {(mapSrc || mapSrcRO) && (
          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {mapSrcRO && (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold uppercase tracking-wider text-primary">Peta Alamat RO</div>
                <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                  <iframe
                    src={mapSrcRO}
                    title="Lokasi kantor RO"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[360px] border-0"
                  />
                </div>
              </div>
            )}
            {mapSrc && (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold uppercase tracking-wider text-primary">Peta Alamat HO</div>
                <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                  <iframe
                    src={mapSrc}
                    title="Lokasi kantor HO"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[360px] border-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function WaDropdown({ wa, wa2, wa3 }: { wa: string; wa2: string; wa3: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const admins = [
    { label: "Admin 1", num: wa },
    { label: "Admin 2", num: wa2 },
    { label: "Admin 3", num: wa3 },
  ].filter((a) => a.num);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="border border-border px-8 py-4 font-semibold uppercase tracking-wider text-sm hover:-translate-y-1 hover:border-primary hover:text-primary hover:bg-card hover:shadow-lg transition-all duration-300 flex items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm5.392-3.32c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        </svg>
        WhatsApp
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-card border border-border shadow-xl rounded-sm w-48 animate-in fade-in slide-in-from-bottom-2 z-50">
          <div className="px-4 py-2 text-xs uppercase tracking-wider text-primary border-b border-border font-semibold">Pilih Admin</div>
          {admins.map((a) => (
            <a
              key={a.num}
              href={`https://wa.me/${a.num}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm5.392-3.32c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              </svg>
              {a.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
