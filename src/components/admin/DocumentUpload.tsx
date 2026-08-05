import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/integrations/supabase/client";

export type DocItem = { name: string; url: string; size?: number };

export function asDocs(v: unknown): DocItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((d): d is DocItem => !!d && typeof d === "object" && typeof (d as any).url === "string")
    .map((d) => ({ name: d.name || "Dokumen", url: d.url, size: d.size }));
}

export function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MAX_PER_FILE = 1 * 1024 * 1024; // 1MB per file

/** Upload multiple downloadable documents (max 1MB each) with drag-and-drop. */
export function DocumentListEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: DocItem[]) => void;
}) {
  const items = asDocs(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const supabase = createClient();

  const handleFiles = async (files: FileList) => {
    const fileArr = Array.from(files);

    // Validate sizes
    const oversized = fileArr.find((f) => f.size > MAX_PER_FILE);
    if (oversized) {
      toast.error(`"${oversized.name}" melebihi batas 1MB per file`);
      return;
    }

    setUploading(true);
    const uploaded: DocItem[] = [];
    try {
      for (const file of fileArr) {
        const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
        const path = `docs/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw error;
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        uploaded.push({ name: file.name, url: data.publicUrl, size: file.size });
      }
      onChange([...items, ...uploaded]);
      toast.success(`${uploaded.length} dokumen berhasil diunggah`);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengunggah dokumen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* Document list */}
      {items.map((d, i) => (
        <div key={i} className="flex items-center gap-2 border border-border px-3 py-2">
          <svg className="w-4 h-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <Input
            value={d.name}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...d, name: e.target.value };
              onChange(next);
            }}
            className="flex-1 h-7 text-sm"
          />
          <span className="text-xs text-muted-foreground shrink-0">{formatSize(d.size)}</span>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-7 px-2 text-xs"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            Hapus
          </Button>
        </div>
      ))}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Drag & drop zone */}
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
          w-full border-2 border-dashed rounded-sm p-5 text-center cursor-pointer transition-all select-none
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
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <span className="text-sm font-medium">Lepas untuk mengunggah</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span className="text-sm font-medium">Seret dokumen ke sini atau klik untuk pilih</span>
            <span className="text-xs">Bisa pilih beberapa dokumen sekaligus</span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Maksimal <strong>1MB</strong> per file. Format: PDF, DOC, XLS, PPT, ZIP, dll.
      </p>
    </div>
  );
}