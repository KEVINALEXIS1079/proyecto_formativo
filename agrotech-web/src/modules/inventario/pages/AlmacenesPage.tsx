import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { useAlmacenList } from "../hooks/useAlmacenList";
import type { Almacen } from "../model/types";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "descripcion", label: "Descripción" },
  { key: "acciones", label: "Acciones" },
];

export default function AlmacenesPage() {
  const { data: almacenes = [], isLoading } = useAlmacenList();

  const renderCell = (item: Almacen, columnKey: string) => {
    switch (columnKey) {
      case "nombre":
        return item.nombre;
      case "descripcion":
        return item.descripcion || "N/A";
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Almacenes</h1>
          <p className="text-sm opacity-70">Gestión de almacenes</p>
        </div>
        <Button color="primary">Crear Almacén</Button>
      </div>

      <Table aria-label="Tabla de almacenes">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={almacenes} isLoading={isLoading} emptyContent="No hay almacenes">
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