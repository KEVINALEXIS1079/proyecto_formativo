// src/modules/usuarios/widgets/UserTable.tsx
import { Button, Chip, Image, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import type { UsuarioLite } from "../api/usuario";

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

export default function UserTable({
  items,
  onView,
}: {
  items: UsuarioLite[];
  onView: (u: UsuarioLite) => void;
}) {
  return (
    <Table aria-label="usuarios" removeWrapper isVirtualized={false} className="[&_[data-slot=td]]:py-2 [&_[data-slot=tr]]:hover:bg-success/10">
      <TableHeader>
        <TableColumn>Foto</TableColumn>
        <TableColumn>Usuario</TableColumn>
        <TableColumn>Rol</TableColumn>
        <TableColumn>Ficha</TableColumn>
        <TableColumn>Estado</TableColumn>
        <TableColumn className="text-right">Acciones</TableColumn>
      </TableHeader>

      <TableBody items={items} emptyContent="Sin resultados">
        {(u) => (
          <TableRow key={u.id}>
            <TableCell>
              {u.avatar ? (
                <Image
                  src={
                    /^(data:|blob:|https?:\/\/)/i.test(u.avatar)
                      ? u.avatar
                      : (() => {
                          const cleanBase = FILES_BASE.replace(/\/+$/, "");
                          const rel = u.avatar.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
                          return `${cleanBase}/${rel}`;
                        })()
                  }
                  alt={u.nombre}
                  width={40}
                  height={40}
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                  N/A
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{u.nombre} {u.apellido}</span>
                <span className="text-xs opacity-60">{u.cedula}</span>
              </div>
            </TableCell>
            <TableCell>{u.rol?.nombre ?? "—"}</TableCell>
            <TableCell>{u.idFicha ?? "—"}</TableCell>
            <TableCell>
              <Chip
                size="sm"
                color={u.estado === "activo" ? "success" : u.estado === "inactivo" ? "warning" : "default"}
                variant="flat"
              >
                {u.estado}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <Button size="sm" variant="flat" color="success" onPress={() => onView(u)}>Ver</Button>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
