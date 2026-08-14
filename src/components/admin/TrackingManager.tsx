import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  listTrackings,
  getTrackingWithUpdates,
  createTracking,
  updateTracking,
  deleteTracking,
  addTrackingUpdate,
  updateTrackingUpdate,
  deleteTrackingUpdate,
  TRACKING_STATUSES,
  type OrderTracking,
  type TrackingUpdate,
} from "@/lib/tracking.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STEPS = TRACKING_STATUSES as unknown as string[];

function statusIndex(status: string) {
  return STATUS_STEPS.indexOf(status);
}

function statusColor(status: string) {
  switch (status) {
    case "PO Diterima":       return "#3b82f6";
    case "Barang Diproses":   return "#f59e0b";
    case "Siap Dikirim":      return "#8b5cf6";
    case "Dalam Pengiriman":  return "#06b6d4";
    case "Barang Diterima":   return "#22c55e";
    default:                  return "#6b7280";
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
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Convert ISO string → datetime-local input value (YYYY-MM-DDTHH:mm) */
function toDatetimeLocal(iso?: string): string {
  if (!iso) {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  }
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TrackingManager — main admin component
// ─────────────────────────────────────────────────────────────────────────────

export function TrackingManager() {
  const qc = useQueryClient();

  const listFn      = useServerFn(listTrackings);
  const detailFn    = useServerFn(getTrackingWithUpdates);
  const createFn    = useServerFn(createTracking);
  const updateFn    = useServerFn(updateTracking);
  const deleteFn    = useServerFn(deleteTracking);
  const addUpdFn    = useServerFn(addTrackingUpdate);
  const editUpdFn   = useServerFn(updateTrackingUpdate);
  const delUpdFn    = useServerFn(deleteTrackingUpdate);

  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState<OrderTracking | null>(null);
  const [searchQ, setSearchQ]         = useState("");

  // List query
  const { data: trackings = [], isLoading } = useQuery({
    queryKey: ["admin-trackings"],
    queryFn: () => listFn(),
  });

  // Detail query
  const { data: detail } = useQuery({
    queryKey: ["admin-tracking-detail", selectedId],
    queryFn: () => detailFn({ data: { id: selectedId! } }),
    enabled: !!selectedId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-trackings"] });
    qc.invalidateQueries({ queryKey: ["admin-tracking-detail", selectedId] });
  };

  // ── Mutations ──────────────────────────────────────────────────────────────

  const mutCreate = useMutation({
    mutationFn: (d: { po_number: string; customer: string; item_name: string; event_date?: string }) =>
      createFn({ data: d }),
    onSuccess: (row) => {
      toast.success(`Tracking ${row?.id} berhasil dibuat!`);
      setShowForm(false);
      setSelectedId(row?.id ?? null);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const mutUpdate = useMutation({
    mutationFn: (d: { id: string; po_number: string; customer: string; item_name: string }) =>
      updateFn({ data: d }),
    onSuccess: () => { toast.success("Tracking diperbarui."); setEditItem(null); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const mutDelete = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Tracking dihapus."); setSelectedId(null); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const mutAddUpd = useMutation({
    mutationFn: (d: { tracking_id: string; status: string; note?: string; event_date?: string }) =>
      addUpdFn({ data: d }),
    onSuccess: () => { toast.success("Status ditambahkan."); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const mutEditUpd = useMutation({
    mutationFn: (d: { id: string; tracking_id: string; status: string; note?: string; event_date?: string }) =>
      editUpdFn({ data: d }),
    onSuccess: () => { toast.success("Update berhasil diubah."); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const mutDelUpd = useMutation({
    mutationFn: (d: { id: string; tracking_id: string }) => delUpdFn({ data: d }),
    onSuccess: () => { toast.success("Update dihapus."); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = trackings.filter((t) => {
    const q = searchQ.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.po_number.toLowerCase().includes(q) ||
      t.item_name.toLowerCase().includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display uppercase">Tracking Pesanan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola status pengiriman barang customer
          </p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setEditItem(null); }}
          className="shrink-0"
          id="btn-add-tracking"
        >
          + Tambah Tracking
        </Button>
      </div>

      {/* Create / Edit Form */}
      {(showForm || editItem) && (
        <TrackingForm
          initial={editItem}
          onSubmit={(d) => {
            if (editItem) {
              mutUpdate.mutate({ id: editItem.id, ...d });
            } else {
              mutCreate.mutate(d);
            }
          }}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
          loading={mutCreate.isPending || mutUpdate.isPending}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: list */}
        <div className="lg:col-span-2 space-y-3">
          <Input
            placeholder="Cari ID, customer, PO, barang..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            id="tracking-search"
          />
          {isLoading && (
            <div className="text-muted-foreground text-sm">Memuat...</div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="text-muted-foreground text-sm">Belum ada data tracking.</div>
          )}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((t) => (
              <TrackingRow
                key={t.id}
                tracking={t}
                selected={selectedId === t.id}
                onSelect={() => setSelectedId(t.id)}
                onEdit={() => { setEditItem(t); setShowForm(false); }}
                onDelete={() => {
                  if (confirm(`Hapus tracking ${t.id}? Data tidak bisa dikembalikan.`)) {
                    mutDelete.mutate(t.id);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: detail */}
        <div className="lg:col-span-3">
          {!selectedId ? (
            <div className="border border-dashed border-border rounded p-10 text-center text-muted-foreground text-sm">
              Pilih salah satu tracking di sebelah kiri untuk melihat detail & timeline
            </div>
          ) : !detail ? (
            <div className="text-muted-foreground text-sm">Memuat detail...</div>
          ) : (
            <TrackingDetail
              tracking={detail.tracking}
              updates={detail.updates}
              onAddUpdate={(d) => mutAddUpd.mutate({ tracking_id: detail.tracking.id, ...d })}
              onEditUpdate={(d) => mutEditUpd.mutate({ tracking_id: detail.tracking.id, ...d })}
              onDeleteUpdate={(id) => mutDelUpd.mutate({ id, tracking_id: detail.tracking.id })}
              addLoading={mutAddUpd.isPending}
              editLoading={mutEditUpd.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TrackingForm — create or edit the main order header
// ─────────────────────────────────────────────────────────────────────────────

function TrackingForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial: OrderTracking | null;
  onSubmit: (d: { po_number: string; customer: string; item_name: string; event_date?: string }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [po, setPo]           = useState(initial?.po_number ?? "");
  const [cust, setCust]       = useState(initial?.customer ?? "");
  const [item, setItem]       = useState(initial?.item_name ?? "");
  const [eventDate, setEventDate] = useState(toDatetimeLocal());

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!po || !cust || !item) { toast.error("Semua field wajib diisi."); return; }
    onSubmit({ po_number: po, customer: cust, item_name: item, event_date: initial ? undefined : eventDate });
  };

  return (
    <form
      onSubmit={handle}
      className="border border-border bg-card p-5 rounded space-y-4"
    >
      <h3 className="font-display uppercase text-base">
        {initial ? `Edit Tracking ${initial.id}` : "Tambah Tracking Baru"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tf-po">Nomor PO</Label>
          <Input id="tf-po" value={po} onChange={(e) => setPo(e.target.value)} placeholder="PO-2024-001" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tf-customer">Customer</Label>
          <Input id="tf-customer" value={cust} onChange={(e) => setCust(e.target.value)} placeholder="PT. Contoh Maju" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tf-item">Nama Barang</Label>
          <Input id="tf-item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Pompa Sentrifugal 5HP" />
        </div>
      </div>
      {!initial && (
        <div className="space-y-1.5">
          <Label htmlFor="tf-event-date">Tanggal PO Diterima</Label>
          <input
            id="tf-event-date"
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full max-w-xs rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}
      {!initial && (
        <p className="text-xs text-muted-foreground">
          Tracking ID akan dibuat otomatis dengan format <span className="font-mono text-primary">MPA-XXXXXX</span>
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} id="btn-save-tracking">
          {loading ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Buat Tracking"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TrackingRow
// ─────────────────────────────────────────────────────────────────────────────

function TrackingRow({
  tracking,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  tracking: OrderTracking;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = statusColor(tracking.status);
  return (
    <div
      onClick={onSelect}
      className={`border rounded p-3 cursor-pointer transition-all hover:border-primary/50 ${
        selected ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">{tracking.id}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {statusIcon(tracking.status)} {tracking.status}
            </span>
          </div>
          <div className="text-sm font-medium mt-1 truncate">{tracking.customer}</div>
          <div className="text-xs text-muted-foreground truncate">{tracking.item_name}</div>
          <div className="text-xs text-muted-foreground">PO: {tracking.po_number}</div>
        </div>
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-muted-foreground hover:text-destructive px-1.5 py-0.5 rounded hover:bg-muted transition"
            title="Hapus"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EditUpdateModal — inline edit form for a single timeline step
// ─────────────────────────────────────────────────────────────────────────────

function EditUpdateModal({
  update,
  onSave,
  onCancel,
  loading,
}: {
  update: TrackingUpdate;
  onSave: (d: { id: string; status: string; note?: string; event_date?: string }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [status, setStatus]     = useState(update.status);
  const [note, setNote]         = useState(update.note ?? "");
  const [eventDate, setEventDate] = useState(toDatetimeLocal(update.event_date ?? update.created_at));

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: update.id, status, note: note || undefined, event_date: eventDate });
  };

  return (
    <div className="mt-2 mb-2 bg-muted/50 border border-border rounded p-3 space-y-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Edit Step
      </div>
      <form onSubmit={handle} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status */}
          <div className="space-y-1">
            <Label htmlFor={`edit-status-${update.id}`} className="text-xs">Status</Label>
            <select
              id={`edit-status-${update.id}`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {STATUS_STEPS.map((s) => (
                <option key={s} value={s}>{statusIcon(s)} {s}</option>
              ))}
            </select>
          </div>
          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor={`edit-date-${update.id}`} className="text-xs">Tanggal</Label>
            <input
              id={`edit-date-${update.id}`}
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        {/* Note */}
        <div className="space-y-1">
          <Label htmlFor={`edit-note-${update.id}`} className="text-xs">Catatan (opsional)</Label>
          <Input
            id={`edit-note-${update.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mis. No resi JNE: 12345"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TrackingDetail
// ─────────────────────────────────────────────────────────────────────────────

function TrackingDetail({
  tracking,
  updates,
  onAddUpdate,
  onEditUpdate,
  onDeleteUpdate,
  addLoading,
  editLoading,
}: {
  tracking: OrderTracking;
  updates: TrackingUpdate[];
  onAddUpdate: (d: { status: string; note?: string; event_date?: string }) => void;
  onEditUpdate: (d: { id: string; status: string; note?: string; event_date?: string }) => void;
  onDeleteUpdate: (id: string) => void;
  addLoading: boolean;
  editLoading: boolean;
}) {
  const [selStatus, setSelStatus]   = useState(STATUS_STEPS[0]);
  const [note, setNote]             = useState("");
  const [eventDate, setEventDate]   = useState(toDatetimeLocal());
  const [editingId, setEditingId]   = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUpdate({ status: selStatus, note: note || undefined, event_date: eventDate });
    setNote("");
    setEventDate(toDatetimeLocal());
  };

  const currentIdx = statusIndex(tracking.status);
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.event_date ?? b.created_at).getTime() - new Date(a.event_date ?? a.created_at).getTime()
  );

  return (
    <div className="border border-border bg-card rounded p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary text-lg">{tracking.id}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                backgroundColor: `${statusColor(tracking.status)}22`,
                color: statusColor(tracking.status),
              }}
            >
              {statusIcon(tracking.status)} {tracking.status}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            <span className="font-medium text-foreground">{tracking.customer}</span> · {tracking.item_name}
          </div>
          <div className="text-xs text-muted-foreground">PO: {tracking.po_number}</div>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          Dibuat: {formatDate(tracking.created_at)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((s, i) => {
          const done  = i <= currentIdx;
          const color = done ? statusColor(s) : "#374151";
          return (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1" style={{ minWidth: 0 }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    backgroundColor: done ? color : "#1f2937",
                    border: `2px solid ${color}`,
                    color: done ? "#fff" : color,
                  }}
                >
                  {done ? (i === currentIdx ? statusIcon(s) : "✓") : i + 1}
                </div>
                <div
                  className="text-center leading-tight"
                  style={{
                    fontSize: "9px",
                    color: done ? color : "#6b7280",
                    fontWeight: done ? 600 : 400,
                    maxWidth: "52px",
                  }}
                >
                  {s}
                </div>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mb-4"
                  style={{
                    backgroundColor: i < currentIdx ? statusColor(STATUS_STEPS[i]) : "#374151",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Riwayat Update
        </h4>
        {updates.length === 0 && (
          <div className="text-xs text-muted-foreground">Belum ada update.</div>
        )}
        <div className="relative space-y-0">
          {sortedUpdates.map((u, i, arr) => (
            <div key={u.id}>
              <div className="flex gap-3 group">
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: statusColor(u.status) }}
                  />
                  {i < arr.length - 1 && (
                    <div className="w-px flex-1 bg-border min-h-[24px]" />
                  )}
                </div>
                <div className="pb-1 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-sm font-medium">{statusIcon(u.status)} {u.status}</span>
                      {u.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{u.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {formatDate(u.event_date ?? u.created_at)}
                      </p>
                    </div>
                    {/* Action buttons: visible on hover */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <button
                        onClick={() => setEditingId(editingId === u.id ? null : u.id)}
                        className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition"
                        title="Edit step"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Hapus update ini?")) onDeleteUpdate(u.id);
                        }}
                        className="text-xs text-destructive hover:text-destructive/80 px-1.5 py-0.5 rounded hover:bg-muted transition"
                        title="Hapus"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Inline edit form */}
              {editingId === u.id && (
                <div className="ml-6">
                  <EditUpdateModal
                    update={u}
                    onSave={(d) => {
                      onEditUpdate(d);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    loading={editLoading}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add update form */}
      <form onSubmit={handleAdd} className="border-t border-border pt-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Tambah Update Status
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="upd-status" className="text-xs">Status</Label>
            <select
              id="upd-status"
              value={selStatus}
              onChange={(e) => setSelStatus(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {STATUS_STEPS.map((s) => (
                <option key={s} value={s}>{statusIcon(s)} {s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="upd-date" className="text-xs">Tanggal</Label>
            <input
              id="upd-date"
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="upd-note" className="text-xs">Catatan (opsional)</Label>
          <Input
            id="upd-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mis. No resi JNE: 12345"
          />
        </div>
        <Button type="submit" disabled={addLoading} size="sm" id="btn-add-update">
          {addLoading ? "Menambahkan..." : "Tambah Update"}
        </Button>
      </form>
    </div>
  );
}
