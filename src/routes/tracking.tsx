import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicTracking, type OrderTracking } from "@/lib/tracking.functions";
import { trackCourier, type CourierTrackResult } from "@/lib/courier.functions";
import { z } from "zod";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/tracking")({
  head: () => ({
    meta: [
      { title: "Cek Status Pengiriman" },
      {
        name: "description",
        content: "Lacak status pengiriman barang pesanan Anda secara real-time dengan memasukkan No. PO atau Tracking ID.",
      },
    ],
  }),
  validateSearch: z.object({ id: z.string().optional() }),
  component: TrackingPage,
});



function courierStatusColor(status: string) {
  switch (status) {
    case "DELIVERED":        return { bg: "#22c55e15", border: "#22c55e", text: "#16a34a", solid: "#22c55e" };
    case "OUT_FOR_DELIVERY": return { bg: "#06b6d415", border: "#06b6d4", text: "#0891b2", solid: "#06b6d4" };
    case "IN_TRANSIT":       return { bg: "#8b5cf615", border: "#8b5cf6", text: "#7c3aed", solid: "#8b5cf6" };
    case "ON_PROCESS":       return { bg: "#f59e0b15", border: "#f59e0b", text: "#d97706", solid: "#f59e0b" };
    case "PICKED_UP":        return { bg: "#3b82f615", border: "#3b82f6", text: "#2563eb", solid: "#3b82f6" };
    default:                 return { bg: "#6b728015", border: "#6b7280", text: "#4b5563", solid: "#6b7280" };
  }
}


function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    weekday: "short", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg, var(--color-muted) 25%, var(--color-input) 50%, var(--color-muted) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        borderRadius: "6px",
        ...style,
      }}
    />
  );
}

function CourierResult({ result, itemName }: { result: CourierTrackResult, itemName?: string }) {
  const color = courierStatusColor(result.status);
  const isDelivered = result.status === "DELIVERED";
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        overflow: "hidden",
        animation: "fadeSlideUp 0.5s ease both",
      }}
    >
      <div className="p-5 sm:p-7 border-b border-border" style={{ background: isDelivered ? "#EFFAF4" : "#EEF3F0" }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">{result.courier_label}</span>
              <span style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }} className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full">{result.status_label}</span>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-primary tracking-widest">{result.awb}</div>
            {itemName && <div className="text-foreground font-semibold mt-1.5">{itemName}</div>}
            {result.desc && <div className="text-sm text-foreground mt-1 max-w-sm">{result.desc}</div>}
          </div>
          {(result.receiver || result.date) && (
            <div className="text-left sm:text-right w-full sm:w-auto bg-white/40 sm:bg-transparent p-3 sm:p-0 rounded-lg">
              {result.receiver && <><div className="text-muted-foreground text-[10px] sm:text-[11px] uppercase tracking-wider">Penerima</div><div className="text-foreground font-medium text-sm sm:text-base">{result.receiver}</div></>}
              {result.date && <div className="text-muted-foreground text-[10px] sm:text-[11px] mt-1">{result.date}</div>}
            </div>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-7">
        <div className="text-slate-500 text-[10px] sm:text-[11px] uppercase tracking-widest mb-4 sm:mb-5">Riwayat Perjalanan Paket</div>
        {result.history.length === 0 ? (
          <div className="text-muted-foreground text-center py-6 text-sm">Belum ada riwayat tersedia.</div>
        ) : (
          <div className="relative">
            {result.history.map((h, i, arr) => {
              const isFirst = i === 0;
              return (
                <div key={i} className="flex gap-3 sm:gap-4" style={{ animation: `fadeSlideUp 0.4s ease ${i * 0.07}s both` }}>
                  <div className="flex flex-col items-center w-5 shrink-0">
                    <div className="rounded-full shrink-0 mt-1" style={{ width: isFirst ? "14px" : "10px", height: isFirst ? "14px" : "10px", background: isFirst ? color.solid : "var(--color-muted-foreground)", boxShadow: isFirst ? `0 0 10px ${color.solid}` : "none" }} />
                    {i < arr.length - 1 && <div className="flex-1 w-[1px] bg-border min-h-[24px] sm:min-h-[32px]" />}
                  </div>
                  <div className={`flex-1 ${i < arr.length - 1 ? "pb-4 sm:pb-5" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                      <div>
                        <div className="font-semibold text-sm sm:text-[15px]" style={{ color: isFirst ? color.text : "var(--color-foreground)" }}>{h.desc}</div>
                        {h.location && <div className="text-muted-foreground text-xs sm:text-[13px] mt-0.5 sm:mt-1">{"📍"} {h.location}</div>}
                      </div>
                      <div className="text-muted-foreground text-[10px] sm:text-xs shrink-0">{h.date}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TrackingResult({ tracking }: { tracking: OrderTracking }) {
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        overflow: "hidden",
        animation: "fadeSlideUp 0.5s ease both",
      }}
    >
      <div className="p-5 sm:p-7" style={{ background: "#EEF3F0" }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Informasi Pesanan</span>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-primary tracking-widest">{tracking.po_number}</div>
            <div className="text-foreground text-sm mt-1.5 font-mono">ID: {tracking.id}</div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto bg-white/40 sm:bg-transparent p-3 sm:p-0 rounded-lg">
            <div className="text-muted-foreground text-[10px] sm:text-[11px] uppercase tracking-wider">Customer</div>
            <div className="text-foreground font-medium text-sm sm:text-base">{tracking.customer}</div>
            <div className="text-muted-foreground text-[10px] sm:text-[11px] mt-1">{tracking.resi?.length || 0} Pengiriman</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingPage() {
  const { id: searchId } = Route.useSearch();
  const navigate       = useNavigate();
  const getTracking    = useServerFn(getPublicTracking);
  const trackCourierFn = useServerFn(trackCourier);
  const inputRef       = useRef<HTMLInputElement>(null);

  const [inputId, setInputId]   = useState(searchId ?? "");
  
  // Data internal
  const [internalTracking, setInternalTracking] = useState<OrderTracking | null>(null);
  const [notFound, setNotFound]                 = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState<string | null>(null);

  // Data ekspedisi
  const [courierResults, setCourierResults] = useState<{ id: string; result: CourierTrackResult | null; error: string | null }[]>([]);
  const [courierLoading, setCourierLoading] = useState(false);

  useEffect(() => {
    if (searchId) {
      handleSearch(searchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (id?: string) => {
    const query = (id ?? inputId).trim().toUpperCase();
    if (!query) return;
    setLoading(true);
    setNotFound(false);
    setError(null);
    setInternalTracking(null);
    setCourierResults([]);
    
    try {
      const data = await getTracking({ data: { id: query } });
      if (!data || !data.tracking) {
        setNotFound(true);
      } else {
        setInternalTracking(data.tracking);
        navigate({ to: "/tracking", search: { id: query }, replace: true });
        
        // Auto-fetch courier if resi exists
        if (data.tracking.resi && data.tracking.resi.length > 0) {
          setCourierLoading(true);
          
          const results = await Promise.all(
            data.tracking.resi.map(async (r) => {
              try {
                if (!r.courier || !r.resi_number) {
                   return { id: r.id, result: null, error: "Data resi tidak lengkap" };
                }
                const cRes = await trackCourierFn({ data: { courier: r.courier, awb: r.resi_number } });
                return { id: r.id, result: cRes, error: null };
              } catch (e: any) {
                return { id: r.id, result: null, error: e.message ?? "Gagal mengambil data ekspedisi." };
              }
            })
          );
          
          setCourierResults(results);
          setCourierLoading(false);
        }
      }
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan saat mencari ID Tracking.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (v: string) => {
    const cleaned = v.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setInputId(cleaned);
  };

  const LoadingSkeleton = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeSlideUp 0.3s ease both" }}>
      <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "16px", justifyContent: "space-between" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            <Skeleton style={{ height: "28px", width: "180px" }} />
            <Skeleton style={{ height: "20px", width: "260px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
            <Skeleton style={{ height: "14px", width: "80px" }} />
            <Skeleton style={{ height: "18px", width: "140px" }} />
          </div>
        </div>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", gap: "16px" }}>
              <Skeleton style={{ width: "12px", height: "12px", borderRadius: "50%", marginTop: "4px" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <Skeleton style={{ height: "16px", width: "260px" }} />
                <Skeleton style={{ height: "13px", width: "160px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tracking-input::placeholder { color: #94a3b8; }
        .tracking-input:focus { outline: none; }
        .track-btn { transition: all 0.2s ease; }
        .track-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .track-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="pt-20 flex-1 pb-32">
          <section className="border-b border-border bg-card/30">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Layanan Pelanggan</div>
                  <h1 className="font-display text-3xl md:text-5xl uppercase leading-tight">
                    Lacak <span className="text-gradient-orange">Pesanan Anda</span>
                  </h1>
                  <p className="text-muted-foreground text-sm mt-2">
                    Masukkan No. PO atau Tracking ID untuk melihat detail pesanan dan posisi pengiriman.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div style={{ maxWidth: "820px", margin: "32px auto 80px", padding: "0 24px" }} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-5">
              <div style={{ background: "linear-gradient(135deg, #f59e0b10, #e85d0410)", border: "1px solid #f59e0b30", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "var(--color-muted-foreground)" }}>
                {"📋"} <strong style={{ color: "var(--color-foreground)" }}>Mulai Pelacakan</strong>
                {" — masukkan No. PO atau Tracking ID yang diberikan tim kami (format: "}
                <span style={{ fontFamily: "monospace", color: "var(--color-primary)" }}>MPA-XXXXXX</span>{")"}
              </div>

              <div className="bg-card border border-border rounded-xl p-2 sm:pl-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 flex-1 px-2 py-1 sm:p-0">
                  <span className="text-xl shrink-0">{"🔍"}</span>
                  <input
                    ref={inputRef}
                    className="tracking-input w-full bg-transparent border-none text-foreground text-sm sm:text-lg font-mono tracking-wider focus:outline-none placeholder:text-muted-foreground"
                    type="text"
                    placeholder="Masukkan No. PO (Contoh: PO-2026-001)"
                    value={inputId}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    maxLength={10}
                    id="tracking-id-input"
                  />
                </div>
                <button
                  className="track-btn bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-lg w-full sm:w-auto shrink-0"
                  onClick={() => handleSearch()}
                  disabled={loading || !inputId.trim()}
                  id="btn-cek-tracking"
                >
                  {loading ? "Mencari..." : "Lacak Sekarang"}
                </button>
              </div>

              {loading && <LoadingSkeleton />}

              {!loading && notFound && (
                <div style={{ textAlign: "center", padding: "60px 24px", animation: "fadeSlideUp 0.4s ease both" }}>
                  <div style={{ fontSize: "64px", marginBottom: "16px" }}>{"🔎"}</div>
                  <div style={{ color: "var(--color-foreground)", fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
                    No. PO atau Tracking ID tidak ditemukan
                  </div>
                  <div style={{ color: "var(--color-muted-foreground)", fontSize: "14px" }}>
                    {"Pastikan ID yang Anda masukkan sudah benar. Contoh: "}<span style={{ fontFamily: "monospace" }}>PO-2026-001</span>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "20px 24px", color: "#b91c1c", fontSize: "14px", animation: "fadeSlideUp 0.4s ease both" }}>
                  {"❌"} {error}
                </div>
              )}

              {/* Internal Tracking Result */}
              {!loading && internalTracking && (
                <TrackingResult tracking={internalTracking} />
              )}
              
              {/* Courier Status Loading / Result */}
              {!loading && internalTracking?.resi && internalTracking.resi.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mt-6 mb-4">
                    <div className="flex-1 h-px bg-border"></div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
                      {"📦"} Daftar Pengiriman ({internalTracking.resi.length})
                    </div>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                  
                  {courierLoading && (
                    <div className="space-y-4">
                      {internalTracking.resi.map((_, i) => <LoadingSkeleton key={i} />)}
                    </div>
                  )}
                  
                  {!courierLoading && (
                    <div className="space-y-6">
                      {internalTracking.resi.map((r, i) => {
                        const res = courierResults.find(cr => cr.id === r.id);
                        return (
                          <div key={r.id} className="relative">
                            <div className="absolute -left-3 -top-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10 border-2 border-background">
                              {i + 1}
                            </div>
                            {res?.error ? (
                               <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "16px", padding: "24px 28px", color: "#b91c1c", fontSize: "14px", animation: "fadeSlideUp 0.4s ease both" }}>
                                 <div className="font-semibold mb-1 text-base">{r.item_name}</div>
                                 {"❌"} {res.error} (Resi: {r.resi_number})
                               </div>
                            ) : res?.result ? (
                               <CourierResult result={res.result} itemName={r.item_name} />
                            ) : (
                               <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "24px 28px", color: "var(--color-muted-foreground)", fontSize: "14px" }}>
                                 <div className="font-semibold mb-1 text-base text-foreground">{r.item_name}</div>
                                 Tidak ada data tracking untuk {r.courier} - {r.resi_number}
                               </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
