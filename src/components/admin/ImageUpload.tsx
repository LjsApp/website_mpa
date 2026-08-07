import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { adminUploadMedia } from "@/lib/admin.functions";

export function ImageUpload({
  value,
  onChange,
  label,
  maxSizeMB,
  maxSizeKB,
  webpOnly,
  onBeforeUpload,
  folder,
  fileName,
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
  /** Batas ukuran dalam KB (lebih prioritas dari maxSizeMB jika keduanya diset) */
  maxSizeKB?: number;
  /** Jika true, hanya menerima file .webp */
  webpOnly?: boolean;
  onBeforeUpload?: (file: File) => Promise<boolean>;
  folder?: string;
  fileName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const uploadMediaFn = useServerFn(adminUploadMedia);

  const handleFile = async (file: File) => {
    // Validasi format .webp
    if (webpOnly) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "webp" || file.type !== "image/webp") {
        toast.error("Hanya file .webp yang diperbolehkan. Silakan konversi gambar Anda ke format WebP terlebih dahulu.");
        return;
      }
    } else if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validasi ukuran file
    const limitBytes = maxSizeKB
      ? maxSizeKB * 1024
      : (maxSizeMB || 5) * 1024 * 1024;
    const limitLabel = maxSizeKB
      ? `${maxSizeKB}KB`
      : `${maxSizeMB || 5}MB`;

    if (file.size > limitBytes) {
      toast.error(`Ukuran gambar maksimal ${limitLabel}. File Anda: ${(file.size / 1024).toFixed(0)}KB`);
      return;
    }

    if (onBeforeUpload) {
      const allowed = await onBeforeUpload(file);
      if (!allowed) return;
    }

    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "webp").toLowerCase();
      let path = `${crypto.randomUUID()}.${ext}`;
      if (folder && fileName) {
        path = `${folder}/${fileName}.${ext}`;
      } else if (folder) {
        path = `${folder}/${path}`;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);

      const publicUrl = await uploadMediaFn({ data: formData });
      onChange(publicUrl);
      toast.success("Gambar berhasil diunggah");
    } catch (e: any) {
      toast.error(e.message || "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // Tentukan accept attribute berdasarkan webpOnly
  const acceptAttr = webpOnly ? "image/webp" : "image/*";

  return (
    <div className="space-y-2">
      {label && <div className="text-sm font-medium">{label}</div>}
      {webpOnly && (
        <p className="text-xs text-muted-foreground">
          ⚠️ Hanya menerima format <strong>.webp</strong>
          {maxSizeKB ? ` · Maks. ${maxSizeKB}KB` : maxSizeMB ? ` · Maks. ${maxSizeMB}MB` : ""}
        </p>
      )}
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-36 h-24 border border-border overflow-hidden bg-muted/30 shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-36 h-24 border border-dashed border-border flex items-center justify-center text-[11px] text-muted-foreground text-center px-2 shrink-0">
            Belum ada gambar
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Mengunggah..." : value ? "Ganti Gambar" : "Unggah Gambar"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Hapus Gambar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}