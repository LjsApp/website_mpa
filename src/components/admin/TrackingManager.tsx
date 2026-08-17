import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  listTrackings,
  createTracking,
  updateTracking,
  deleteTracking,
  type OrderTracking,
} from "@/lib/tracking.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COURIERS } from "@/lib/courier.functions";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function courierLabel(code: string | null | undefined) {
  if (!code) return "-";
  return COURIERS.find((c) => c.code === code)?.label ?? code.toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TrackingManager — main admin component
// ─────────────────────────────────────────────────────────────────────────────

export function TrackingManager() {
  const qc = useQueryClient();

  const listFn   = useServerFn(listTrackings);
  const createFn = useServerFn(createTracking);
  const updateFn = useServerFn(updateTracking);
  const deleteFn = useServerFn(deleteTracking);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState<OrderTracking | null>(null);
  const [searchQ, setSearchQ]     = useState("");
  const [copied, setCopied]       = useState<string | null>(null);

  const { data: trackings = [], isLoading } = useQuery({
    queryKey: ["admin-trackings"],
    queryFn: () => listFn(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-trackings"] });

  const mutCreate = useMutation({
    mutationFn: (d: { po_number: string; customer: string; item_name: string; courier?: string; resi_number?: string }) =>
      createFn({ data: d }),
    onSuccess: (row) => {
      toast.success(`Tracking ${row?.id} berhasil dibuat!`);
      setShowModal(false);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const mutUpdate = useMutation({
    mutationFn: (d: { id: string; po_number: string; customer: string; item_name: string; courier?: string; resi_number?: string }) =>
      updateFn({ data: d }),
    onSuccess: () => {
      toast.success("Tracking diperbarui.");
      setEditItem(null);
      setShowModal(false);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const mutDelete = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Tracking dihapus."); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    toast.success(`ID ${id} disalin!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const openAdd = () => { setEditItem(null); setShowModal(true); };
  const openEdit = (t: OrderTracking) => { setEditItem(t); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditItem(null); };

  const filtered = trackings.filter((t) => {
    const q = searchQ.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.po_number.toLowerCase().includes(q) ||
      t.item_name.toLowerCase().includes(q) ||
      (t.resi_number ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display uppercase">Tracking Pesanan</h2>
          <p className="text-sm text-muted-foreground mt-1">Kelola data pengiriman barang customer</p>
        </div>
        <Button onClick={openAdd} className="shrink-0" id="btn-add-tracking">
          + Tambah Tracking
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari ID, customer, PO, barang, resi..."
        value={searchQ}
        onChange={(e) => setSearchQ(e.target.value)}
        id="tracking-search"
        className="max-w-sm"
      />

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">No. PO</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Nama Barang</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Ekspedisi</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">No. Resi</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Tracking ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Tanggal</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">Memuat data...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    {searchQ ? "Tidak ada hasil pencarian." : "Belum ada data tracking. Klik + Tambah Tracking untuk memulai."}
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={`border-b border-border transition-colors hover:bg-muted/20 ${idx % 2 === 0 ? "bg-background" : "bg-muted/5"}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.po_number}</td>
                    <td className="px-4 py-3 font-medium">{t.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{t.item_name}</td>
                    <td className="px-4 py-3">
                      {t.courier ? (
                        <span className="text-xs uppercase font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {courierLabel(t.courier)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.resi_number || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-primary">{t.id}</span>
                        <button
                          onClick={() => handleCopy(t.id)}
                          title="Salin ID"
                          className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded"
                          id={`btn-copy-${t.id}`}
                        >
                          {copied === t.id ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          title="Edit"
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          id={`btn-edit-${t.id}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus tracking ${t.id}? Data tidak bisa dikembalikan.`)) {
                              mutDelete.mutate(t.id);
                            }
                          }}
                          title="Hapus"
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          id={`btn-delete-${t.id}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            Menampilkan {filtered.length} dari {trackings.length} data
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TrackingModal
          initial={editItem}
          onSubmit={(d) => {
            if (editItem) {
              mutUpdate.mutate({ id: editItem.id, ...d });
            } else {
              mutCreate.mutate(d);
            }
          }}
          onClose={closeModal}
          loading={mutCreate.isPending || mutUpdate.isPending}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TrackingModal
// ─────────────────────────────────────────────────────────────────────────────

function TrackingModal({
  initial,
  onSubmit,
  onClose,
  loading,
}: {
  initial: OrderTracking | null;
  onSubmit: (d: { po_number: string; customer: string; item_name: string; courier?: string; resi_number?: string }) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [po, setPo]           = useState(initial?.po_number ?? "");
  const [cust, setCust]       = useState(initial?.customer ?? "");
  const [item, setItem]       = useState(initial?.item_name ?? "");
  const [courier, setCourier] = useState(initial?.courier ?? "");
  const [resi, setResi]       = useState(initial?.resi_number ?? "");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!po || !cust || !item) { toast.error("No. PO, Customer, dan Nama Barang wajib diisi."); return; }
    onSubmit({
      po_number: po,
      customer: cust,
      item_name: item,
      courier: courier || undefined,
      resi_number: resi || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg"
        style={{ animation: "modalIn 0.2s ease both" }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.97) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-display uppercase text-base font-bold">
              {initial ? `Edit Tracking ${initial.id}` : "Tambah Tracking Baru"}
            </h3>
            {!initial && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ID akan dibuat otomatis: <span className="font-mono text-primary">MPA-XXXXXX</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            id="btn-close-modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handle} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tf-po">Nomor PO <span className="text-destructive">*</span></Label>
              <Input id="tf-po" value={po} onChange={(e) => setPo(e.target.value)} placeholder="PO-2024-001" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tf-customer">Customer <span className="text-destructive">*</span></Label>
              <Input id="tf-customer" value={cust} onChange={(e) => setCust(e.target.value)} placeholder="PT. Contoh Maju" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tf-item">Nama Barang <span className="text-destructive">*</span></Label>
            <Input id="tf-item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Pompa Sentrifugal 5HP" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tf-courier">Kurir Ekspedisi</Label>
              <select
                id="tf-courier"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">- Tanpa Kurir -</option>
                {COURIERS.map((c) => (
                  <option key={c.code} value={c.code}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tf-resi">No. Resi</Label>
              <Input id="tf-resi" value={resi} onChange={(e) => setResi(e.target.value)} placeholder="Masukkan nomor resi..." />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} id="btn-save-tracking">
              {loading ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Buat Tracking"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
