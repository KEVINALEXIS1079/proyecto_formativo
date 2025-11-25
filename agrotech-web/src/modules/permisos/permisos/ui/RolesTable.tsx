import { Button, Table, TableBody, TableCell, TableHeader, TableColumn, TableRow } from "@heroui/react";
import { Eye, Plus } from "lucide-react";
import Surface from "./Surface";

export default function RolesTable({
  roles, selected, onPick, onView, onAddClick,
}: { roles: string[]; selected: string | null; onPick: (r: string) => void; onView: (r: string) => void; onAddClick: () => void; }) {
  // Filtrar roles válidos y convertir a objetos
  const validRoles = roles.filter((r) => r && typeof r === 'string').map((r) => ({ key: r, nombre: r }));

  return (
    <Surface className="sticky top-4 h-[calc(100dvh-200px)] overflow-hidden">
      <div className="h-full flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wide opacity-70">Roles</h3>
          <Button size="sm" color="success" startContent={<Plus className="h-4 w-4" />} onPress={onAddClick}>Agregar rol</Button>
        </div>

        <div className="flex-1 overflow-auto rounded-xl">
          <Table aria-label="roles" removeWrapper isVirtualized={false} className="[&_[data-slot=td]]:py-2 [&_[data-slot=tr]]:hover:bg-success/10">
            <TableHeader>
              <TableColumn>Rol</TableColumn>
              <TableColumn className="w-28 text-right">Acción</TableColumn>
            </TableHeader>
            <TableBody items={validRoles} emptyContent="Sin roles">
              {(item) => (
                <TableRow key={item.key} className={`transition-colors ${selected === item.nombre ? "bg-success/15" : ""}`}>
                  <TableCell className="font-medium cursor-pointer" onClick={() => onPick(item.nombre)}>{item.nombre}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button size="sm" variant="light" isIconOnly aria-label="ver rol" onClick={(e) => { e.stopPropagation(); onView(item.nombre); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Surface>
  );
}
