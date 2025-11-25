import { Input, Pagination, Table, TableBody, TableCell, TableHeader, TableColumn, TableRow } from "@heroui/react";
import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import Surface from "./Surface";
import type { UsuarioLite } from "../model/types";

export default function UsuariosTable({
  onPick, selectedId, users,
}: { onPick: (u: UsuarioLite) => void; selectedId?: number | null; users: UsuarioLite[]; }) {
  const [query, setQuery] = useState(""); const [page, setPage] = useState(1); const rowsPerPage = 12;

  const filtrados = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(u =>
      (u.nombre ?? "").toLowerCase().includes(q) ||
      (u.cedula ?? "").includes(query) ||
      String(u.id_ficha ?? "").includes(query)
    );
  }, [query, users]);

  const pages = Math.max(1, Math.ceil(filtrados.length / rowsPerPage));
  const items = useMemo(() => filtrados.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage), [page, filtrados]);
  useEffect(() => { if (page > pages) setPage(1); }, [pages, page]);

  return (
    <Surface className="sticky top-4 h-[calc(100dvh-200px)] overflow-hidden">
      <div className="flex flex-col h-full gap-3">
        <Input startContent={<Search className="h-4 w-4" />} placeholder="Buscar por nombre, cédula o ficha"
               value={query} onChange={(e) => setQuery(e.target.value)} size="sm" className="bg-transparent" />
        <div className="flex-1 overflow-auto rounded-xl">
          <Table aria-label="usuarios" removeWrapper isHeaderSticky isVirtualized={false} className="max-h-full [&_[data-slot=tr]]:hover:bg-success/10 [&_[data-slot=td]]:py-2">
            <TableHeader>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>CC</TableColumn>
              <TableColumn>Ficha</TableColumn>
              <TableColumn>Rol</TableColumn>
            </TableHeader>
            <TableBody items={items} emptyContent="Sin resultados">
              {(u) => (
                <TableRow key={u.id} onClick={() => onPick(u)} className={`cursor-pointer transition-colors ${selectedId === u.id ? "bg-success/15" : ""}`}>
                  <TableCell className="font-medium">{u.nombre}</TableCell>
                  <TableCell>{u.cedula}</TableCell>
                  <TableCell>{String(u.id_ficha ?? "")}</TableCell>
                  <TableCell>{typeof u.rol === "string" ? u.rol : (u.rol as { nombre?: string })?.nombre ?? ""}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end"><Pagination page={page} total={pages} onChange={setPage} size="sm" showShadow={false} color="success" /></div>
      </div>
    </Surface>
  );
}
