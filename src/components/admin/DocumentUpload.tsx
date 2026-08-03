import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { adminUploadMedia } from "@/lib/admin.functions";

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

const MAX = 2 * 1024 * 1024;

/** Upload a list of downloadable documents (max 2MB each). */
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
  const uploadMediaFn = useServerFn(adminUploadMedia);

  const handleFile = async (file: File) => {
    if (file.size > MAX) {
      toast.error("Ukuran dokumen maksimal 2MB");
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
      const path = `docs/${crypto.randomUUID()}.${ext}`;
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);

      const publicUrl = await uploadMediaFn({ data: formData });
      
      onChange([...items, { name: file.name, url: publicUrl, size: file.size }]);
      toast.success("Dokumen berhasil diunggah");
    } catch (e: any) {
      toast.error(e.message || "Gagal mengunggah dokumen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {items.map((d, i) => (
        <div key={i} className="flex items-center gap-2 border border-border px-3 py-2">
          <Input
            value={d.name}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...d, name: e.target.value };
              onChange(next);
            }}
          />
          <span className="text-xs text-muted-foreground shrink-0">{formatSize(d.size)}</span>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            Hapus
          </Button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Mengunggah..." : "+ Unggah Dokumen (maks 2MB)"}
      </Button>
    </div>
  );
}