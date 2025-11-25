import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { useProveedorList } from "../hooks/useProveedorList";
import type { Proveedor } from "../model/types";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "acciones", label: "Acciones" },
];

export default function ProveedoresPage() {
  const { data: proveedores = [], isLoading } = useProveedorList();

  const renderCell = (item: Proveedor, columnKey: string) => {
    switch (columnKey) {
      case "nombre":
        return item.nombre;
      case "acciones":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="flat" color="primary">Editar</Button>
            <Button size="sm" variant="flat" color="danger">Eliminar</Button>
          </div>
        );
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-sm opacity-70">Gestión de proveedores</p>
        </div>
        <Button color="primary">Crear Proveedor</Button>
      </div>

      <Table aria-label="Tabla de proveedores">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={proveedores} isLoading={isLoading} emptyContent="No hay proveedores">
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}