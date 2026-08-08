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
        onChange={() => {}}
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
              className={`relative w-24 h-24 border overflow-hidden cursor-move transition-all ${
                draggedIdx === i ? "opacity-40 border-primary scale-95" : "border-border hover:border-primary/60"
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
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
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