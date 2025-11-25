import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Image } from "@heroui/react";
import { Upload, X } from "lucide-react";

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

interface ImagePreviewProps {
  value?: string;
  onFileChange: (file: File | null) => void;
  label?: string;
}

export default function ImagePreview({ value, onFileChange, label = "Imagen" }: ImagePreviewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    onFileChange(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileChange(null);
  };

  const previewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : value
      ? (() => {
          if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
          const cleanBase = FILES_BASE.replace(/\/+$/, "");
          const rel = value.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
          return `${cleanBase}/${rel}`;
        })()
      : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative">
            <Image
              src={previewUrl}
              alt="Preview"
              width={80}
              height={80}
              className="object-cover rounded-lg border"
              onError={() => console.error('Error loading image')}
            />
            <Button
              size="sm"
              variant="flat"
              color="danger"
              isIconOnly
              className="absolute -top-2 -right-2"
              onPress={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-default-300 rounded-lg flex items-center justify-center">
            <Upload className="h-6 w-6 text-default-400" />
          </div>
        )}
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="max-w-xs"
          />
        </div>
      </div>
    </div>
  );
}