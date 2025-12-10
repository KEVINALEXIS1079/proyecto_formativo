// src/modules/iot/tipo-sensor/ui/ImagePreview.tsx
import { useEffect, useMemo, useState } from "react";

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

type Props = {
  src?: string | File | Blob | null;
  alt?: string;
  size?: number;
  className?: string;
};

export default function ImagePreview({ src, alt = "imagen tipo sensor", size = 56, className }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    if (src instanceof File || src instanceof Blob) {
      const url = URL.createObjectURL(src);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBlobUrl(null);
  }, [src]);

  const resolved = useMemo(() => {
    if (!src) return null;
    if (src instanceof File || src instanceof Blob) return blobUrl;
    const val = String(src);
    if (/^(data:|blob:|https?:\/\/)/i.test(val)) return val;
    const cleanBase = FILES_BASE.replace(/\/+$/, "");
    const rel = val.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
    return `${cleanBase}/${rel}`;
  }, [src, blobUrl]);

  if (!resolved || error) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-content1 shadow-sm ${className || ""}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] text-foreground-400 select-none">sin imagen</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-content1 shadow-sm overflow-hidden ${className || ""}`}
      style={{ width: size, height: size }}
    >
      <img
        key={resolved}
        src={resolved}
        alt={alt}
        loading="lazy"
        draggable={false}
        className="w-full h-full object-contain select-none outline-none ring-0"
        style={{ border: "none" }}
        onError={() => setError(true)}
      />
    </div>
  );
}