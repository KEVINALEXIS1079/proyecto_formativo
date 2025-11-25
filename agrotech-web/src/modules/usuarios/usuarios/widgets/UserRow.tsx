import { Button, Chip, Kbd, Tooltip, User as HeroUser } from "@heroui/react";
import { Eye, Shield } from "lucide-react";
import type { UsuarioLite } from "../model/types";
import { ESTADO_COLOR } from "../model/types";

export default function UserRow({
  u,
  onView,
}: {
  u: UsuarioLite;
  onView: (u: UsuarioLite) => void;
}) {
  return (
    <>
      <HeroUser name={`${u.nombre} ${u.apellido}`} description={`CC ${u.cedula}`} avatarProps={{ src: u.avatar }} />
      <Chip variant="flat" startContent={<Shield size={14} />}>{u.rol.nombre}</Chip>
      <div className="flex items-center gap-2"><Kbd>Ficha</Kbd>{u.idFicha}</div>
      <Chip color={ESTADO_COLOR[u.estado]} variant="flat" size="sm" className="capitalize">
        {u.estado}
      </Chip>
      <div className="text-right">
        <Tooltip content="Ver información">
          <Button isIconOnly size="sm" variant="flat" onPress={() => onView(u)}>
            <Eye size={16} />
          </Button>
        </Tooltip>
      </div>
    </>
  );
}
