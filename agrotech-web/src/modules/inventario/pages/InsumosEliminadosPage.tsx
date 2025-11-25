import { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "categoria", label: "Categoría" },
  { key: "proveedor", label: "Proveedor" },
  { key: "almacen", label: "Almacén" },
  { key: "fechaEliminacion", label: "Fecha Eliminación" },
  { key: "acciones", label: "Acciones" },
];

export default function InsumosEliminadosPage() {
  const [q, setQ] = useState("");
  // TODO: Implementar hook para insumos eliminados
  const insumos: any[] = [];
  const isLoading = false;

  const renderCell = (item: any, columnKey: string) => {
    switch (columnKey) {
      case "nombre":
        return item.nombre;
      case "categoria":
        return item.categoria?.nombre;
      case "proveedor":
        return item.proveedor?.nombre;
      case "almacen":
        return item.almacen?.nombre;
      case "fechaEliminacion":
        return item.fechaEliminacion ? new Date(item.fechaEliminacion).toLocaleDateString('es-CO') : "N/A";
      case "acciones":
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="flat" color="success">Restaurar</Button>
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Insumos Eliminados</h1>
          <p className="text-sm opacity-70">Gestión de insumos eliminados</p>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar insumos eliminados..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table aria-label="Tabla de insumos eliminados">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={insumos} isLoading={isLoading} emptyContent="No hay insumos eliminados">
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