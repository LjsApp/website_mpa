import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminList, adminUpsert, adminDelete } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import {
  StringListEditor,
  ObjectListEditor,
  TagsInput,
  ImageListEditor,
  DbSelect,
  ManagedDbSelect,
  type ObjectColumn,
  type ManageField,
  LocationGeocodeEditor,
  IconPickerField,
  PIN_ICONS,
} from "./field-editors";
import { RichTextEditor } from "./RichTextEditor";
import { DocumentListEditor } from "./DocumentUpload";

/** Convert any text to a URL-friendly slug: lowercase, words separated by '-' */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")    // keep only alphanumeric, spaces, hyphens
    .trim()
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-");            // collapse multiple hyphens
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "date"
  | "image"
  | "list"
  | "list-multiline"
  | "object-list"
  | "tags"
  | "html"
  | "image-list"
  | "doc-list"
  | "db-select"
  | "boolean"
  | "location"
  | "icon-picker";
export interface FieldDef {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  columns?: ObjectColumn[];
  /** If true, field is managed in state but not rendered in the form UI */
  hidden?: boolean;
  // db-select config
  optionsTable?: string;
  optionValue?: string;
  optionLabel?: string;
  /** Map other fields from the selected option row: { targetField: sourceColumn } */
  extraSet?: Record<string, string>;
  /** Enable inline add/edit/delete of the option rows next to the dropdown. */
  manage?: boolean;
  manageFields?: ManageField[];
  manageDefaults?: Record<string, unknown>;
  manageTitle?: string;
  /** If true, image upload only accepts .webp files */
  webpOnly?: boolean;
  /** Max file size in KB for image upload */
  maxSizeKB?: number;
}

export interface CrudConfig {
  table:
    | "projects"
    | "products"
    | "articles"
    | "brands"
    | "clients"
    | "testimonials"
    | "product_categories"
    | "project_categories"
    | "article_categories"
    | "company_admins";
  title: string;
  primaryField: string; // column shown as main label in list
  columns: { name: string; label: string }[];
  fields: FieldDef[];
  defaults?: Record<string, unknown>;
}

export function CrudManager({ config }: { config: CrudConfig }) {
  const qc = useQueryClient();
  const listFn = useServerFn(adminList);
  const upsertFn = useServerFn(adminUpsert);
  const deleteFn = useServerFn(adminDelete);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", config.table],
    queryFn: () => listFn({ data: { table: config.table } }),
  });

  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [open, setOpen] = useState(false);

  const upsert = useMutation({
    mutationFn: (row: Record<string, any>) => upsertFn({ data: { table: config.table, row } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", config.table] });
      toast.success("Tersimpan");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { table: config.table, id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", config.table] });
      toast.success("Dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Name of the primary text field (title/name) — used for auto-slug */
  const titleFieldName = config.fields.find((f) => f.name === "title" || f.name === "name")?.name;
  const hasSlugField = config.fields.some((f) => f.name === "slug");

  const openNew = () => {
    setEditing({ ...(config.defaults ?? {}) });
    setOpen(true);
  };
  const openEdit = (row: Record<string, any>) => {
    setEditing({ ...row });
    setOpen(true);
  };

  /** Set a field value; if the field is the title/name, also auto-generate slug on new entries */
  const setField = (fieldName: string, value: unknown) => {
    const next: Record<string, any> = { ...(editing ?? {}), [fieldName]: value };
    // Auto-slug: only when no existing id (new entry) and slug is empty or was auto-generated
    if (
      hasSlugField &&
      fieldName === titleFieldName &&
      !editing?.id
    ) {
      next.slug = slugify(String(value ?? ""));
    }
    setEditing(next);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const payload: Record<string, any> = { ...editing };
    for (const f of config.fields) {
      if (f.type === "number" && payload[f.name] !== "" && payload[f.name] != null) {
        payload[f.name] = Number(payload[f.name]);
      }
      if ((f.type === "list" || f.type === "list-multiline") && !Array.isArray(payload[f.name])) {
        payload[f.name] = [];
      }
      if (f.type === "object-list" && !Array.isArray(payload[f.name])) {
        payload[f.name] = [];
      }
      if (f.type === "image-list" && !Array.isArray(payload[f.name])) {
        payload[f.name] = [];
      }
      if (f.type === "doc-list" && !Array.isArray(payload[f.name])) {
        payload[f.name] = [];
      }
      if (f.type === "tags" && !Array.isArray(payload[f.name])) {
        payload[f.name] = [];
      }
      if (f.type === "html" && typeof payload[f.name] !== "string") {
        payload[f.name] = "";
      }
    }

    upsert.mutate(payload);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display uppercase">{config.title}</h2>
          <p className="text-sm text-muted-foreground">{rows.length} entri</p>
        </div>
        <Button onClick={openNew}>+ Tambah Baru</Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Memuat...</div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider">
              <tr>
                {config.columns.map((c) => <th key={c.name} className="px-4 py-3">{c.label}</th>)}
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/20">
                  {config.columns.map((c) => {
                    const fieldDef = config.fields.find(f => f.name === c.name);
                    if (fieldDef?.type === "boolean") {
                      return (
                        <td key={c.name} className="px-4 py-3">
                          <Switch
                            checked={!!row[c.name]}
                            onCheckedChange={(val) => upsert.mutate({ ...row, [c.name]: val })}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={c.name} className="px-4 py-3 max-w-[300px] truncate">
                        {/_url$/.test(c.name) ? (
                          row[c.name] ? (
                            <img src={row[c.name]} alt="" className="w-12 h-12 object-contain bg-muted/30 border border-border" />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )
                        ) : (
                          String(row[c.name] ?? "")
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      if (confirm("Hapus entri ini?")) del.mutate(row.id);
                    }}>Hapus</Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={config.columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} {config.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {config.fields.filter((f) => !f.hidden).map((f) => {
              const val = editing?.[f.name];
              const set = (v: unknown) => setField(f.name, v);
              return (
                <div key={f.name} className="space-y-1">
                  <Label>{f.label}{f.required && " *"}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      value={val ?? ""}
                      required={f.required}
                      placeholder={f.placeholder}
                      rows={4}
                      onChange={(e) => set(e.target.value)}
                    />
                  ) : f.type === "image" ? (
                    <ImageUpload 
                      value={val ?? ""} 
                      onChange={(url) => set(url)} 
                      folder={config.table === "brands" ? "brand" : config.table === "clients" ? "klien" : undefined}
                      fileName={editing?.name ? editing.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined}
                      webpOnly={f.webpOnly}
                      maxSizeKB={f.maxSizeKB}
                    />
                  ) : f.type === "list" ? (
                    <StringListEditor value={val} placeholder={f.placeholder} onChange={(v) => set(v)} />
                  ) : f.type === "list-multiline" ? (
                    <StringListEditor value={val} multiline placeholder={f.placeholder} onChange={(v) => set(v)} />
                  ) : f.type === "object-list" ? (
                    <ObjectListEditor value={val} columns={f.columns ?? []} onChange={(v) => set(v)} />
                  ) : f.type === "image-list" ? (
                    <ImageListEditor value={val} onChange={(v) => set(v)} />
                  ) : f.type === "doc-list" ? (
                    <DocumentListEditor value={val} onChange={(v) => set(v)} />
                  ) : f.type === "location" ? (
                    <LocationGeocodeEditor
                      address={val ?? ""}
                      lat={editing?.lat}
                      lng={editing?.lng}
                      onChange={(data) => {
                        setEditing((prev: any) => ({
                          ...prev,
                          address: data.address,
                          lat: data.lat,
                          lng: data.lng,
                        }));
                      }}
                    />
                  ) : f.type === "icon-picker" ? (
                    <IconPickerField value={val ?? null} onChange={(v) => set(v)} />
                  ) : f.type === "tags" ? (
                    <TagsInput value={val} placeholder={f.placeholder} onChange={(v) => set(v)} />
                  ) : f.type === "db-select" ? (
                    f.manage ? (
                    <ManagedDbSelect
                      table={f.optionsTable!}
                      optionValue={f.optionValue ?? "name"}
                      optionLabel={f.optionLabel ?? "name"}
                      value={val}
                      required={f.required}
                      manageFields={f.manageFields ?? [{ key: f.optionLabel ?? "name", label: f.label }]}
                      manageDefaults={f.manageDefaults}
                      manageTitle={f.manageTitle}
                      onSelect={(row) => {
                        const next: Record<string, any> = { ...(editing ?? {}) };
                        next[f.name] = row ? row[f.optionValue ?? "name"] : "";
                        if (f.extraSet) {
                          for (const [target, src] of Object.entries(f.extraSet)) {
                            next[target] = row ? row[src] : "";
                          }
                        }
                        setEditing(next);
                      }}
                    />
                    ) : (
                    <DbSelect
                      table={f.optionsTable!}
                      optionValue={f.optionValue ?? "name"}
                      optionLabel={f.optionLabel ?? "name"}
                      value={val}
                      required={f.required}
                      onSelect={(row) => {
                        const next: Record<string, any> = { ...(editing ?? {}) };
                        next[f.name] = row ? row[f.optionValue ?? "name"] : "";
                        if (f.extraSet) {
                          for (const [target, src] of Object.entries(f.extraSet)) {
                            next[target] = row ? row[src] : "";
                          }
                        }
                        setEditing(next);
                      }}
                    />
                    )
                  ) : f.type === "boolean" ? (
                    <div className="flex items-center space-x-3 h-10">
                      <Switch checked={!!val} onCheckedChange={(v) => set(v)} />
                      <span className="text-sm text-muted-foreground">Aktifkan</span>
                    </div>
                  ) : f.type === "html" ? (
                    <RichTextEditor value={val} placeholder={f.placeholder} onChange={(v) => set(v)} />
                  ) : f.type === "select" ? (
                    <select
                      value={val ?? ""}
                      required={f.required}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      onChange={(e) => set(e.target.value)}
                    >
                      <option value="" disabled>Pilih…</option>
                      {(f.options ?? []).map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={val ?? ""}
                      required={f.required}
                      placeholder={f.placeholder}
                      onChange={(e) => set(e.target.value)}
                    />
                  )}
                </div>
              );
            })}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={upsert.isPending}>
                {upsert.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}