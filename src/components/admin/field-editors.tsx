import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "./ImageUpload";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminList, adminUpsert, adminDelete } from "@/lib/admin.functions";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function SearchableSelect({
  rows,
  optionValue,
  optionLabel,
  current,
  required,
  onSelect,
}: {
  rows: any[];
  optionValue: string;
  optionLabel: string;
  current: string;
  required?: boolean;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedRow = rows.find((r) => String(r[optionValue]) === current);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal bg-background px-3 py-1 text-sm h-9 shadow-sm",
            !current && "text-muted-foreground"
          )}
        >
          {selectedRow ? String(selectedRow[optionLabel]) : "Pilih…"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari..." />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {rows.map((r) => (
                <CommandItem
                  key={r.id}
                  value={String(r[optionLabel])} // command uses this for searching text
                  onSelect={() => {
                    onSelect(String(r[optionValue]));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      current === String(r[optionValue]) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {String(r[optionLabel])}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      <input
        type="text"
        tabIndex={-1}
        className="sr-only"
        required={required}
        value={current}
        onChange={() => { }}
        onFocus={() => setOpen(true)}
      />
    </Popover>
  );
}

/** Select whose options are loaded from a database table (admin only). */
export function DbSelect({
  table,
  optionValue,
  optionLabel,
  value,
  required,
  onSelect,
}: {
  table: string;
  optionValue: string;
  optionLabel: string;
  value: unknown;
  required?: boolean;
  onSelect: (row: Record<string, any> | null) => void;
}) {
  const listFn = useServerFn(adminList);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", table],
    queryFn: () => listFn({ data: { table: table as any } }),
  });
  const current = value == null ? "" : String(value);
  return (
    <SearchableSelect
      rows={rows as any[]}
      optionValue={optionValue}
      optionLabel={optionLabel}
      current={current}
      required={required}
      onSelect={(v) => {
        const row = (rows as any[]).find((r) => String(r[optionValue]) === v) ?? null;
        onSelect(row);
      }}
    />
  );
}

export interface ManageField {
  key: string;
  label: string;
  placeholder?: string;
  /** If 'image', renders an ImageUpload instead of a text Input */
  type?: "text" | "image";
  webpOnly?: boolean;
  maxSizeKB?: number;
}

/**
 * A db-select dropdown with an inline "Kelola" (manage) button next to it.
 * Lets the admin add / edit / delete the option rows directly from the form,
 * removing the need for a separate category-management tab.
 */
export function ManagedDbSelect({
  table,
  optionValue,
  optionLabel,
  value,
  required,
  onSelect,
  manageFields,
  manageDefaults,
  manageTitle,
}: {
  table: string;
  optionValue: string;
  optionLabel: string;
  value: unknown;
  required?: boolean;
  onSelect: (row: Record<string, any> | null) => void;
  manageFields: ManageField[];
  manageDefaults?: Record<string, unknown>;
  manageTitle?: string;
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(adminList);
  const upsertFn = useServerFn(adminUpsert);
  const deleteFn = useServerFn(adminDelete);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", table],
    queryFn: () => listFn({ data: { table: table as any } }),
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({ ...(manageDefaults ?? {}) });
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetDraft = () => {
    setDraft({ ...(manageDefaults ?? {}) });
    setEditingId(null);
  };

  const upsert = useMutation({
    mutationFn: (row: Record<string, any>) => upsertFn({ data: { table: table as any, row } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", table] });
      toast.success("Tersimpan");
      resetDraft();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { table: table as any, id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", table] });
      toast.success("Dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const current = value == null ? "" : String(value);

  const onSave = () => {
    for (const f of manageFields) {
      // Hanya validasi required untuk field text, bukan image
      if (f.type !== "image" && !String(draft[f.key] ?? "").trim()) {
        toast.error(`${f.label} wajib diisi`);
        return;
      }
    }
    const payload = { ...(manageDefaults ?? {}), ...draft };
    if (editingId) payload.id = editingId;
    upsert.mutate(payload);
  };

  return (
    <div className="flex gap-2 items-start">
      <SearchableSelect
        rows={rows as any[]}
        optionValue={optionValue}
        optionLabel={optionLabel}
        current={current}
        required={required}
        onSelect={(v) => {
          const row = (rows as any[]).find((r) => String(r[optionValue]) === v) ?? null;
          onSelect(row);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 whitespace-nowrap"
        onClick={() => {
          resetDraft();
          setOpen(true);
        }}
      >
        + Kelola
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{manageTitle ?? "Kelola Data"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 border-b border-border pb-4">
            {manageFields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                {f.type === "image" ? (
                  <ImageUpload
                    value={draft[f.key] ?? ""}
                    onChange={(url) => setDraft({ ...draft, [f.key]: url })}
                    webpOnly={f.webpOnly}
                    maxSizeKB={f.maxSizeKB}
                    folder="brand"
                    fileName={draft["name"] ? String(draft["name"]).toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined}
                  />
                ) : (
                  <Input
                    value={draft[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={upsert.isPending} onClick={onSave}>
                {editingId ? "Simpan Perubahan" : "+ Tambah"}
              </Button>
              {editingId && (
                <Button type="button" size="sm" variant="outline" onClick={resetDraft}>
                  Batal Edit
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {(rows as any[]).length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada data.</p>
            )}
            {(rows as any[]).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 border border-border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Tampilkan thumbnail jika ada logo_url */}
                  {r.logo_url && (
                    <img
                      src={r.logo_url}
                      alt={String(r[optionLabel])}
                      className="w-8 h-8 object-contain shrink-0 bg-white border border-border rounded"
                    />
                  )}
                  <span className="truncate">{String(r[optionLabel])}</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const d: Record<string, any> = { ...(manageDefaults ?? {}) };
                      for (const f of manageFields) d[f.key] = r[f.key] ?? "";
                      setDraft(d);
                      setEditingId(r.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Hapus data ini?")) del.mutate(r.id);
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Editor for an array of plain strings (e.g. features, tags, paragraphs). */
export function StringListEditor({
  value,
  onChange,
  placeholder,
  multiline,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const items: string[] = Array.isArray(value) ? value.map(String) : [];
  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          {multiline ? (
            <Textarea
              rows={3}
              value={item}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
            />
          ) : (
            <Input value={item} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} />
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => remove(i)}>
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        + Tambah
      </Button>
    </div>
  );
}

export interface ObjectColumn {
  key: string;
  label: string;
  multiline?: boolean;
}

/** Editor for a list of images, each uploaded via the storage upload widget. */
export function ImageListEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
}) {
  const items: string[] = Array.isArray(value) ? value.map(String) : [];
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    const next = [...items];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(dropIdx, 0, moved);
    onChange(next);
    setDraggedIdx(null);
  };

  const handleFiles = async (files: FileList) => {
    const MAX_TOTAL_MB = 1;
    const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024;

    // Estimate existing total (just new file sizes + rough existing count)
    const newFiles = Array.from(files);

    // Validasi format - hanya .webp
    const invalidType = newFiles.find((f) => f.type !== "image/webp" || !f.name.toLowerCase().endsWith(".webp"));
    if (invalidType) {
      toast.error(`File "${invalidType.name}" bukan format .webp. Hanya file .webp yang diperbolehkan untuk galeri.`);
      return;
    }

    // Calculate total size of new files
    const newFilesTotal = newFiles.reduce((acc, f) => acc + f.size, 0);

    // Fetch head of existing URLs to sum their sizes
    let existingTotal = 0;
    for (const url of items) {
      if (url.startsWith("http")) {
        try {
          const res = await fetch(url, { method: "HEAD" });
          const len = res.headers.get("content-length");
          if (len) existingTotal += parseInt(len, 10);
        } catch (_) {
          // skip if head fails
        }
      }
    }

    if (existingTotal + newFilesTotal > MAX_TOTAL_BYTES) {
      const used = (existingTotal / (1024 * 1024)).toFixed(2);
      const sisa = Math.max(0, (MAX_TOTAL_BYTES - existingTotal) / (1024 * 1024)).toFixed(2);
      toast.error(
        `Total galeri melebihi ${MAX_TOTAL_MB}MB. Sudah terpakai: ${used}MB, sisa: ${sisa}MB`
      );
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of newFiles) {
        const ext = (file.name.split(".").pop() || "webp").toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw error;
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      onChange([...items, ...uploaded]);
      toast.success(`${uploaded.length} gambar berhasil diunggah`);
    } catch (e) {
      toast.error((e as Error).message || "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  return (
    <div className="space-y-3">
      {/* Thumbnail grid */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => { setDraggedIdx(i); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => {
                // Only handle reorder if dragging an existing thumbnail (not files from OS)
                if (!e.dataTransfer.files?.length) handleDrop(e, i);
                else e.preventDefault();
              }}
              onDragEnd={() => setDraggedIdx(null)}
              className={`relative w-24 h-24 border overflow-hidden cursor-move transition-all ${draggedIdx === i ? "opacity-40 border-primary scale-95" : "border-border hover:border-primary/60"
                }`}
            >
              <img src={item} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute top-0 left-0 right-0 bg-primary/80 text-[9px] text-primary-foreground text-center py-0.5 uppercase tracking-wider">
                  Utama
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute bottom-0 right-0 bg-destructive text-white text-xs px-1.5 py-0.5 hover:bg-destructive/80 transition"
                title="Hapus"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drag & drop zone */}
      <input
        ref={inputRef}
        type="file"
        accept="image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setIsDraggingOver(true); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          if (uploading) return;
          const files = e.dataTransfer.files;
          if (files?.length) handleFiles(files);
        }}
        className={`
          w-full border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all select-none
          ${isDraggingOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/60 hover:bg-muted/20"
          }
          ${uploading ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            <span className="text-sm">Mengunggah...</span>
          </div>
        ) : isDraggingOver ? (
          <div className="flex flex-col items-center gap-2 text-primary">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <span className="text-sm font-medium">Lepas untuk mengunggah</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-sm font-medium">
              {items.length > 0 ? "Seret foto ke sini atau klik untuk tambah" : "Seret foto ke sini atau klik untuk pilih"}
            </span>
            <span className="text-xs">Bisa pilih beberapa foto sekaligus · Hanya format <strong>.webp</strong></span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Total ukuran semua foto maksimal <strong>1MB</strong>. Seret thumbnail untuk mengubah urutan. Foto pertama adalah foto utama.
      </p>
    </div>
  );
}


/** Single input for comma-separated tags, stored as a string array. */
export function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const items: string[] = Array.isArray(value) ? value.map(String) : [];
  return (
    <div className="space-y-2">
      <Input
        defaultValue={items.join(", ")}
        placeholder={placeholder ?? "Pisahkan dengan koma, cth: Maintenance, Industri"}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          )
        }
      />
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((t, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 border border-border uppercase tracking-wider text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Editor for an array of objects with fixed keys (e.g. specs, stats, timeline). */
export function ObjectListEditor({
  value,
  onChange,
  columns,
}: {
  value: unknown;
  onChange: (v: Record<string, string>[]) => void;
  columns: ObjectColumn[];
}) {
  const items: Record<string, string>[] = Array.isArray(value)
    ? (value as Record<string, unknown>[]).map((it) => {
      const o: Record<string, string> = {};
      for (const c of columns) o[c.key] = it?.[c.key] != null ? String(it[c.key]) : "";
      return o;
    })
    : [];
  const update = (i: number, key: string, v: string) => {
    const next = items.map((it) => ({ ...it }));
    next[i][key] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => {
    const blank: Record<string, string> = {};
    for (const c of columns) blank[c.key] = "";
    onChange([...items, blank]);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start border border-border p-3 bg-muted/20">
          <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}>
            {columns.map((c) => (
              <div key={c.key} className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
                {c.multiline ? (
                  <Textarea rows={2} value={item[c.key] ?? ""} onChange={(e) => update(i, c.key, e.target.value)} />
                ) : (
                  <Input value={item[c.key] ?? ""} onChange={(e) => update(i, c.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => remove(i)}>
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        + Tambah
      </Button>
    </div>
  );
}

export function DeliveryLocationEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: any[]) => void;
}) {
  const items: any[] = Array.isArray(value) ? value : [];
  const [geocoding, setGeocoding] = useState<number | null>(null);

  const update = (i: number, key: string, v: any) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: v };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => {
    onChange([...items, { name: "", address: "", lat: 0, lng: 0 }]);
  };

  const handleGeocode = async (i: number) => {
    const item = items[i];
    if (!item.address) {
      toast.error("Alamat kosong");
      return;
    }

    setGeocoding(i);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.address)}`);
      if (!res.ok) throw new Error("Gagal mengambil data lokasi");
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        const next = [...items];
        next[i] = { ...next[i], lat, lng };
        onChange(next);
        toast.success(`Koordinat ditemukan: ${lat}, ${lng}`);
      } else {
        toast.error("Lokasi tidak ditemukan, pastikan alamat lengkap");
      }
    } catch (e: any) {
      toast.error(e.message || "Error saat geocoding");
    } finally {
      setGeocoding(null);
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 border border-border p-3 bg-muted/20">
          <div className="flex gap-2 items-start">
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Nama Perusahaan / Klien</Label>
                <Input value={item.name ?? ""} onChange={(e) => update(i, "name", e.target.value)} placeholder="Contoh: PT ABC Jaya" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Alamat Lengkap</Label>
                <div className="flex gap-2">
                  <Textarea rows={2} value={item.address ?? ""} onChange={(e) => update(i, "address", e.target.value)} placeholder="Jl. Raya No. 1, Kota, Provinsi" className="flex-1" />
                  <Button type="button" variant="secondary" onClick={() => handleGeocode(i)} disabled={geocoding === i} className="h-auto whitespace-nowrap">
                    {geocoding === i ? "Mencari..." : "Set Koordinat"}
                  </Button>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div>Lat: <strong>{item.lat || 0}</strong></div>
                <div>Lng: <strong>{item.lng || 0}</strong></div>
                {(!item.lat || !item.lng) && (
                  <div className="text-destructive font-semibold">⚠️ Koordinat belum diset</div>
                )}
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => remove(i)}>
              ✕
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        + Tambah Lokasi
      </Button>
    </div>
  );
}
export function LocationGeocodeEditor({
  address,
  lat,
  lng,
  onChange,
}: {
  address: string;
  lat: number | null;
  lng: number | null;
  onChange: (data: { address: string; lat: number | null; lng: number | null }) => void;
}) {
  return (
    <div className="space-y-3">
      <Textarea
        rows={3}
        value={address ?? ""}
        onChange={(e) => onChange({ address: e.target.value, lat, lng })}
        placeholder="Jl. Raya No. 1, Kota, Provinsi"
      />
      <div className="grid grid-cols-2 gap-4 border border-border p-3 bg-muted/20 rounded">
        <div className="space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Latitude</Label>
          <Input
            type="number"
            step="any"
            value={lat ?? ""}
            onChange={(e) => onChange({ address, lat: parseFloat(e.target.value) || 0, lng })}
            placeholder="-7.2504"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Longitude</Label>
          <Input
            type="number"
            step="any"
            value={lng ?? ""}
            onChange={(e) => onChange({ address, lat, lng: parseFloat(e.target.value) || 0 })}
            placeholder="112.7688"
          />
        </div>
        {(!lat || !lng) && (
          <div className="col-span-2 text-destructive text-xs font-semibold">⚠️ Koordinat belum diset. Isi dari URL Google Maps.</div>
        )}
      </div>
    </div>
  );
}

// ─── Icon Picker ─────────────────────────────────────────────────────────────

export const PIN_ICONS = [
  { key: "default",    label: "Pin Umum",     svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>` },
  { key: "zap",        label: "PLTU / Listrik", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>` },
  { key: "building",   label: "Gedung / Kantor", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 12h1"/><path d="M14 12h1"/></svg>` },
  { key: "factory",    label: "Pabrik",        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>` },
  { key: "flame",      label: "Kilang / Gas",  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>` },
  { key: "ship",       label: "Pelabuhan",     svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>` },
  { key: "hard-hat",   label: "Konstruksi",    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a8 8 0 0 1 16 0v3"/></svg>` },
  { key: "pickaxe",    label: "Pertambangan",  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.531 12.469 6.619 20.38a1 1 0 1 1-3-3l7.912-7.912"/><path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393"/><path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/><path d="M19.686 8.314a12.501 12.501 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.319"/></svg>` },
  { key: "hospital",   label: "Rumah Sakit",   svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/></svg>` },
  { key: "warehouse",  label: "Gudang",        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="8" height="8" x="8" y="14"/></svg>` },
  { key: "leaf",       label: "Perkebunan",    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>` },
  { key: "anchor",     label: "Maritim",       svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>` },
] as const;

export type PinIconKey = typeof PIN_ICONS[number]["key"];

export function IconPickerField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  const current = value || "default";
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {PIN_ICONS.map((icon) => (
        <button
          key={icon.key}
          type="button"
          onClick={() => onChange(icon.key)}
          title={icon.label}
          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all text-center ${
            current === icon.key
              ? "border-primary bg-primary/10 text-primary shadow-sm"
              : "border-border bg-muted/20 text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          <span
            dangerouslySetInnerHTML={{ __html: icon.svg }}
            className="w-5 h-5 flex-shrink-0"
          />
          <span className="text-[10px] leading-tight">{icon.label}</span>
        </button>
      ))}
    </div>
  );
}
