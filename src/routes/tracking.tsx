import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicTracking, TRACKING_STATUSES, type OrderTracking, type TrackingUpdate } from "@/lib/tracking.functions";
import { z } from "zod";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/tracking")({
  head: () => ({
    meta: [
      { title: "Cek Status Pengiriman" },
      {
        name: "description",
        content: "Lacak status pengiriman barang pesanan Anda secara real-time dengan memasukkan Tracking ID.",
      },
    ],
  }),
  validateSearch: z.object({ id: z.string().optional() }),
  component: TrackingPage,
});

const STATUS_STEPS = TRACKING_STATUSES as unknown as string[];

function statusIndex(status: string) {
  return STATUS_STEPS.indexOf(status);
}

function statusColor(status: string) {
  switch (status) {
    case "PO Diterima":       return { bg: "#3b82f615", border: "#3b82f6", text: "#2563eb", solid: "#3b82f6" };
    case "Barang Diproses":   return { bg: "#f59e0b15", border: "#f59e0b", text: "#d97706", solid: "#f59e0b" };
    case "Siap Dikirim":      return { bg: "#8b5cf615", border: "#8b5cf6", text: "#7c3aed", solid: "#8b5cf6" };
    case "Dalam Pengiriman":  return { bg: "#06b6d415", border: "#06b6d4", text: "#0891b2", solid: "#06b6d4" };
    case "Barang Diterima":   return { bg: "#22c55e15", border: "#22c55e", text: "#16a34a", solid: "#22c55e" };
    default:                  return { bg: "#6b728015", border: "#6b7280", text: "#4b5563", solid: "#6b7280" };
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "PO Diterima":       return "📋";
    case "Barang Diproses":   return "⚙️";
    case "Siap Dikirim":      return "📦";
    case "Dalam Pengiriman":  return "🚚";
    case "Barang Diterima":   return "✅";
    default:                  return "📌";
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    weekday: "short", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

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

// ── TrackingResult ─────────────────────────────────────────────────────────────

function TrackingResult({
  tracking,
  updates,
}: {
  tracking: OrderTracking;
  updates: TrackingUpdate[];
}) {
  const currentIdx = statusIndex(tracking.status);
  const color      = statusColor(tracking.status);
  const isDelivered = tracking.status === "Barang Diterima";

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
      {/* ── Top banner */}
      <div
        style={{
          background: isDelivered
            ? "#EFFAF4"
            : "#EEF3F0",
          padding: "28px 28px 20px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 700, color: "var(--color-primary)", letterSpacing: "2px" }}>
                {tracking.id}
              </span>
              <span
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                {statusIcon(tracking.status)} {tracking.status}
              </span>
            </div>
            <div style={{ color: "var(--color-foreground)", fontSize: "18px", fontWeight: 600, marginTop: "6px" }}>
              {tracking.item_name}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--color-muted-foreground)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Customer</div>
            <div style={{ color: "var(--color-foreground)", fontWeight: 500 }}>{tracking.customer}</div>
            <div style={{ color: "var(--color-muted-foreground)", fontSize: "11px", marginTop: "4px" }}>PO: <span style={{ color: "var(--color-foreground)" }}>{tracking.po_number}</span></div>
          </div>
        </div>
      </div>

      {/* ── Progress Steps */}
      <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0" }}>
          {STATUS_STEPS.map((s, i) => {
            const done   = i <= currentIdx;
            const active = i === currentIdx;
            const c      = statusColor(s);
            return (
              <div key={s} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: "48px" }}>
                  {/* Circle */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: active ? "16px" : "13px",
                      fontWeight: 700,
                      background: done ? c.solid : "var(--color-muted)",
                      border: `2px solid ${done ? c.solid : "var(--color-border)"}`,
                      color: done ? "#fff" : "var(--color-muted-foreground)",
                      boxShadow: active ? `0 0 16px ${c.solid}40` : "none",
                      transition: "all 0.3s ease",
                      zIndex: 1,
                    }}
                  >
                    {active ? statusIcon(s) : done ? "✓" : i + 1}
                  </div>
                  {/* Label */}
                  <div style={{
                    textAlign: "center",
                    fontSize: "9px",
                    lineHeight: "1.3",
                    marginTop: "6px",
                    color: done ? c.text : "var(--color-muted-foreground)",
                    fontWeight: done ? 600 : 400,
                    maxWidth: "52px",
                  }}>
                    {s}
                  </div>
                </div>
                {/* Connector line */}
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: "2px",
                    marginTop: "17px",
                    background: i < currentIdx ? c.solid : "var(--color-border)",
                    transition: "background 0.3s ease",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Timeline */}
      <div style={{ padding: "24px 28px" }}>
        <div style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>
          Riwayat Perjalanan Barang
        </div>

        {updates.length === 0 ? (
          <div style={{ color: "#4b5563", textAlign: "center", padding: "24px 0" }}>
            Belum ada update perjalanan.
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {[...updates].sort((a, b) => new Date(b.event_date ?? b.created_at).getTime() - new Date(a.event_date ?? a.created_at).getTime()).map((u, i, arr) => {
              const c     = statusColor(u.status);
              const isFirst = i === 0;
              return (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    gap: "16px",
                    animation: `fadeSlideUp 0.4s ease ${i * 0.08}s both`,
                  }}
                >
                  {/* Left: dot + line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20px", flexShrink: 0 }}>
                    <div
                      style={{
                        width: isFirst ? "14px" : "10px",
                        height: isFirst ? "14px" : "10px",
                        borderRadius: "50%",
                        background: c.solid,
                        flexShrink: 0,
                        marginTop: "4px",
                        boxShadow: isFirst ? `0 0 10px ${c.solid}` : "none",
                      }}
                    />
                    {i < arr.length - 1 && (
                      <div style={{ flex: 1, width: "1px", background: "var(--color-border)", minHeight: "32px" }} />
                    )}
                  </div>

                  {/* Right: content */}
                  <div style={{ flex: 1, paddingBottom: i < arr.length - 1 ? "20px" : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: isFirst ? c.text : "var(--color-foreground)", fontSize: "14px" }}>
                          {statusIcon(u.status)} {u.status}
                        </div>
                        {u.note && (
                          <div style={{ color: "var(--color-muted-foreground)", fontSize: "13px", marginTop: "3px" }}>
                            {u.note}
                          </div>
                        )}
                      </div>
                      <div style={{ color: "var(--color-muted-foreground)", fontSize: "12px", flexShrink: 0, textAlign: "right" }}>
                        {formatDateShort(u.event_date ?? u.created_at)}
                      </div>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

function TrackingPage() {
  const { id: searchId } = Route.useSearch();
  const navigate         = useNavigate();
  const getTracking      = useServerFn(getPublicTracking);
  const inputRef         = useRef<HTMLInputElement>(null);

  const [inputId, setInputId]   = useState(searchId ?? "");
  const [result, setResult]     = useState<{ tracking: OrderTracking; updates: TrackingUpdate[] } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Auto-search if ID comes from URL
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
    setResult(null);
    try {
      const data = await getTracking({ data: { id: query } });
      if (!data) {
        setNotFound(true);
      } else {
        setResult(data);
        navigate({ to: "/tracking", search: { id: query }, replace: true });
      }
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (v: string) => {
    // Auto format: uppercase, keep alphanumeric+dash
    const cleaned = v.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setInputId(cleaned);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

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
        .track-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .track-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="pt-20 flex-1 pb-32">
          {/* Page header */}
          <section className="border-b border-border bg-card/30">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Layanan Pelanggan</div>
                  <h1 className="font-display text-3xl md:text-5xl uppercase leading-tight">
                    Lacak <span className="text-gradient-orange">Pesanan Anda</span>
                  </h1>
                </div>
              </div>
            </div>
          </section>

          {/* ── Content area */}
          <div style={{ maxWidth: "800px", margin: "40px auto 80px", padding: "0 24px" }} className="flex flex-col gap-8 w-full">
            {/* Search box */}
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "14px",
                padding: "6px 6px 6px 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "20px", flexShrink: 0 }}>🔍</span>
              <input
                ref={inputRef}
                className="tracking-input"
                type="text"
                placeholder="Masukkan Tracking ID (Contoh: MPA-A3K9F2)"
                value={inputId}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={10}
                id="tracking-id-input"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "var(--color-foreground)",
                  fontSize: "18px",
                  fontFamily: "monospace",
                  letterSpacing: "2px",
                  padding: "8px 0",
                }}
              />
              <button
                className="track-btn"
                onClick={() => handleSearch()}
                disabled={loading || !inputId.trim()}
                id="btn-cek-tracking"
                style={{
                  background: "var(--primary)",
                  border: "none",
                  borderRadius: "10px",
                  color: "var(--primary-foreground)",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "12px 24px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {loading ? "Mencari..." : "Cek Sekarang"}
              </button>
            </div>


          {/* Loading skeleton */}
          {loading && (
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
                <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "8px" }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <Skeleton style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
                      <Skeleton style={{ width: "50px", height: "10px" }} />
                    </div>
                  ))}
                </div>
                <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[1,2].map(i => (
                    <div key={i} style={{ display: "flex", gap: "16px" }}>
                      <Skeleton style={{ width: "12px", height: "12px", borderRadius: "50%", marginTop: "4px" }} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Skeleton style={{ height: "16px", width: "160px" }} />
                        <Skeleton style={{ height: "13px", width: "220px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Not found */}
          {!loading && notFound && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                animation: "fadeSlideUp 0.4s ease both",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔎</div>
              <div style={{ color: "var(--color-foreground)", fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
                Tracking ID tidak ditemukan
              </div>
              <div style={{ color: "var(--color-muted-foreground)", fontSize: "14px" }}>
                Pastikan ID yang Anda masukkan sudah benar. Contoh: <span style={{ fontFamily: "monospace", color: "var(--color-muted-foreground)" }}>MPA-A3K9F2</span>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "12px",
                padding: "20px 24px",
                color: "#b91c1c",
                fontSize: "14px",
                animation: "fadeSlideUp 0.4s ease both",
              }}
            >
              ❌ {error}
            </div>
          )}

          {/* Result */}
          {!loading && result && (
            <TrackingResult tracking={result.tracking} updates={result.updates} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  </>
  );
}
