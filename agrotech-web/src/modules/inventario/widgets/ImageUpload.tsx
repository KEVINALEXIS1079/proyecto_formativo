import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@heroui/button";

interface ImageUploadProps {
    onFileChange: (file: File | null) => void;
    currentImageUrl?: string;
    label?: string;
}

export default function ImageUpload({ onFileChange, currentImageUrl, label = "Imagen" }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onFileChange(file);
        } else {
            setPreview(null);
            onFileChange(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleFileChange(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreview(null);
        onFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
            />

            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300
          ${isDragging
                        ? "border-green-500 bg-green-50 scale-105"
                        : preview
                            ? "border-gray-300 bg-gray-50"
                            : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-green-400 hover:bg-green-50"
                    }
        `}
            >
                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                                <Button
                                    size="sm"
                                    color="primary"
                                    variant="solid"
                                    className="font-semibold"
                                    onPress={handleClick}
                                >
                                    Cambiar
                                </Button>
                                <Button
                                    size="sm"
                                    color="danger"
                                    variant="solid"
                                    isIconOnly
                                    onPress={handleRemove}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-3 shadow-lg">
                            <Upload className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-base font-semibold text-gray-700 mb-1">
                            {label}
                        </p>
                        <p className="text-xs text-gray-500 text-center mb-1">
                            Arrastra y suelta aquí
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                            o haz clic para seleccionar
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <ImageIcon className="w-3 h-3" />
                            <span>PNG, JPG, WEBP</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
