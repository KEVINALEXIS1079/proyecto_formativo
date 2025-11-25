import { User as HeroUser } from "@heroui/react";
import { IdCard, Mail, Phone, Shield, UserRound } from "lucide-react";
import type { UsuarioLite } from "../model/types";

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

export default function UserInfoGrid({ u }: { u: UsuarioLite }) {
  return (
    <div className="space-y-3">
      <HeroUser
        name={`${u.nombre} ${u.apellido}`}
        description={`CC ${u.cedula}`}
        avatarProps={{
          src: u.avatar
            ? /^(data:|blob:|https?:\/\/)/i.test(u.avatar)
              ? u.avatar
              : (() => {
                  const cleanBase = FILES_BASE.replace(/\/+$/, "");
                  const rel = u.avatar.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
                  return `${cleanBase}/${rel}`;
                })()
            : undefined,
          size: "lg"
        }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <InfoRow icon={<Shield size={14} />} label="Rol" value={u.rol.nombre} />
        <InfoRow icon={<IdCard size={14} />} label="Ficha" value={u.idFicha} />
        <InfoRow icon={<Mail size={14} />} label="Correo" value={u.correo} />
        <InfoRow icon={<Phone size={14} />} label="Teléfono" value={u.telefono} />
        <InfoRow icon={<UserRound size={14} />} label="Estado" value={u.estado} />
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="opacity-70">{icon}</span>
      <span className="text-default-500 w-28">{label}:</span>
      <span className="font-medium break-all">{value || "—"}</span>
    </div>
  );
}
