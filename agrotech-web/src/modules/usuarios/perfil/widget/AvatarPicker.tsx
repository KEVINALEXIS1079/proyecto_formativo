import { useRef, useState } from "react";
import { Avatar, Button, Tooltip, Image } from "@heroui/react";
import { Camera, X } from "lucide-react";
import { usePerfil } from "../hooks/usePerfil";

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

export default function AvatarPicker() {
  const { me, previewUrl, handleAvatarPick } = usePerfil();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  const src = previewUrl ?? (me?.avatar ? `${FILES_BASE}/${me.avatar}` : "");

  return (
    <>
      <div className="relative inline-block">
        <div className="cursor-pointer" onClick={() => src && setShowModal(true)}>
          <Avatar
            src={src}
            className="w-24 h-24 text-large"
            radius="lg"
          />
        </div>

        <Tooltip content="Cambiar avatar">
          <Button
            isIconOnly
            size="sm"
            className="absolute -bottom-2 -right-2 z-10"
            onPress={() => fileRef.current?.click()}
          >
            <Camera className="w-4 h-4" />
          </Button>
        </Tooltip>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            handleAvatarPick(file);
          }}
        />
      </div>

      {showModal && src && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowModal(false)}
        >
          <div className="relative p-2" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-white p-1 bg-black/50 rounded-full"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={src}
              alt="Avatar zoom"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-lg"
              onError={() => console.error('Error loading avatar')}
            />
          </div>
        </div>
      )}
    </>
  );
}
