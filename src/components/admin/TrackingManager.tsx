import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  listTrackings,
  listClientsMini,
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
  const listClientsFn = useServerFn(listClientsMini);
  const createFn = useServerFn(createTracking);
  const updateFn = useServerFn(updateTracking);
  const deleteFn = useServerFn(deleteTracking);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState<OrderTracking | null>(null);
  const [viewItem, setViewItem]   = useState<OrderTracking | null>(null);
  const [searchQ, setSearchQ]     = useState("");
  const [pageSize, setPageSize]   = useState(10);
  const [page, setPage]           = useState(1);
  const [copied, setCopied]       = useState<string | null>(null);

  const { data: clientsList = [] } = useQuery({
    queryKey: ["admin-clients-mini"],
    queryFn: () => listClientsFn(),
  });

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
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    
    const matchResi = t.resi?.some(r => 
      r.item_name.toLowerCase().includes(q) || 
      r.resi_number.toLowerCase().includes(q) ||
      r.courier.toLowerCase().includes(q)
    ) || false;

    return (
      t.id.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.po_number.toLowerCase().includes(q) ||
      matchResi
    );
  });
  
  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Ensure page is within bounds when filtering changes
  const currentPage = Math.min(page, totalPages);
  
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  

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

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input
          placeholder="Cari ID, PO, barang, resi..."
          value={searchQ}
          onChange={(e) => {
            setSearchQ(e.target.value);
            setPage(1); // Reset page on search
          }}
          id="tracking-search"
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Tampilkan:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={10}>10 Baris</option>
            <option value={20}>20 Baris</option>
            <option value={50}>50 Baris</option>
            <option value={100}>100 Baris</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">No. PO</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Jumlah Resi</th>
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
                paginated.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={`border-b border-border transition-colors hover:bg-muted/20 ${idx % 2 === 0 ? "bg-background" : "bg-muted/5"}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">{t.po_number}</td>
                    <td className="px-4 py-3 text-sm font-medium">{t.customer}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{t.resi?.length || 0} Paket</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewItem(t)}
                          title="Lihat Detail Tracking"
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors inline-block"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
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
          <div className="px-4 py-3 border-t border-border bg-muted/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-muted-foreground">
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} - {Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} data (Total Keseluruhan: {trackings.length})
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2.5 text-xs"
                disabled={currentPage === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Prev
              </Button>
              <div className="text-xs font-medium px-2">
                Hal {currentPage} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 px-2.5 text-xs" 
                disabled={currentPage === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewItem && (
        <TrackingDetailModal
          tracking={viewItem}
          onClose={() => setViewItem(null)}
        />
      )}

      {/* Form Modal */}
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
          clients={clientsList}
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
  clients,
}: {
  initial: OrderTracking | null;
  onSubmit: (d: { po_number: string; customer: string; resi: { id?: string; resi_number: string; courier: string; item_name: string }[] }) => void;
  onClose: () => void;
  loading: boolean;
  clients: string[];
}) {
  const [po, setPo] = useState(initial?.po_number ?? "");
  const [cust, setCust] = useState(initial?.customer ?? "");
  const [resiList, setResiList] = useState<{ id?: string; resi_number: string; courier: string; item_name: string }[]>(
    initial?.resi && initial.resi.length > 0 
      ? initial.resi.map(r => ({ id: r.id, resi_number: r.resi_number, courier: r.courier, item_name: r.item_name }))
      : [{ resi_number: "", courier: "", item_name: "" }]
  );

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!po || !cust) { toast.error("No. PO dan Customer wajib diisi."); return; }
    
    // Filter resi list to only include valid entries
    const validResi = resiList.filter(r => r.resi_number.trim() && r.courier && r.item_name.trim());
    
    onSubmit({
      po_number: po,
      customer: cust,
      resi: validResi,
    });
  };

  const addResi = () => {
    setResiList([...resiList, { resi_number: "", courier: "", item_name: "" }]);
  };

  const updateResi = (index: number, field: string, value: string) => {
    const newList = [...resiList];
    newList[index] = { ...newList[index], [field]: value };
    setResiList(newList);
  };

  const removeResi = (index: number) => {
    if (resiList.length === 1) return;
    const newList = [...resiList];
    newList.splice(index, 1);
    setResiList(newList);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ animation: "modalIn 0.2s ease both" }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.97) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
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
        <form onSubmit={handle} className="flex flex-col overflow-hidden h-full">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tf-po">Nomor PO <span className="text-destructive">*</span></Label>
                <Input id="tf-po" value={po} onChange={(e) => setPo(e.target.value)} placeholder="PO-2024-001" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tf-customer">Customer <span className="text-destructive">*</span></Label>
                <Input id="tf-customer" list="client-list" value={cust} onChange={(e) => setCust(e.target.value)} placeholder="Pilih atau ketik Customer" required autocomplete="off" />
                <datalist id="client-list">
                  {clients.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Daftar Pengiriman (Resi)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addResi}>+ Tambah Resi</Button>
              </div>
              
              <div className="space-y-4">
                {resiList.map((r, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 bg-muted/20 relative">
                    {resiList.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeResi(i)}
                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Resi #{i + 1}</h4>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>Judul Barang <span className="text-destructive">*</span></Label>
                        <Input value={r.item_name} onChange={(e) => updateResi(i, "item_name", e.target.value)} placeholder="Contoh: Gate Valve 6\" required />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Ekspedisi <span className="text-destructive">*</span></Label>
                          <select
                            value={r.courier}
                            onChange={(e) => updateResi(i, "courier", e.target.value)}
                            required
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">- Pilih Kurir -</option>
                            {COURIERS.map((c) => (
                              <option key={c.code} value={c.code}>{c.icon} {c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>No. Resi <span className="text-destructive">*</span></Label>
                          <Input value={r.resi_number} onChange={(e) => updateResi(i, "resi_number", e.target.value)} placeholder="Nomor Resi" required />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-2 p-6 pt-4 border-t border-border bg-card flex-shrink-0 justify-end">
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

// ─────────────────────────────────────────────────────────────────────────────
// TrackingDetailModal
// ─────────────────────────────────────────────────────────────────────────────

function TrackingDetailModal({
  tracking,
  onClose,
}: {
  tracking: OrderTracking;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ animation: "modalIn 0.2s ease both" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h3 className="font-display uppercase text-base font-bold">
              Detail Tracking
            </h3>
            <p className="text-xs font-mono text-primary mt-0.5">
              {tracking.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-border">
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">No. PO</div>
              <div className="font-mono text-sm font-semibold">{tracking.po_number}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Customer</div>
              <div className="text-sm font-semibold">{tracking.customer}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Dibuat Pada</div>
              <div className="text-sm">{formatDate(tracking.created_at)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Jumlah Paket</div>
              <div className="text-sm">{tracking.resi?.length || 0} Paket</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3">Daftar Resi ({tracking.resi?.length || 0})</h4>
            {(!tracking.resi || tracking.resi.length === 0) ? (
              <div className="text-sm text-muted-foreground italic">Belum ada resi.</div>
            ) : (
              <div className="space-y-3">
                {tracking.resi.map((r, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 bg-card">
                    <div className="font-semibold text-sm mb-1">{r.item_name}</div>
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Kurir:</span>{' '}
                        <span className="font-medium text-primary uppercase">{courierLabel(r.courier)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">No. Resi:</span>{' '}
                        <span className="font-mono font-medium">{r.resi_number}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-2 p-6 pt-4 border-t border-border bg-card flex-shrink-0 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
