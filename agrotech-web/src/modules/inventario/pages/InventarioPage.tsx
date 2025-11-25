import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Image } from "@heroui/react";
import { useInsumoList } from "../hooks/useInsumoList";
import { useCategoriaInsumoList } from "../hooks/useCategoriaInsumoList";
import { useProveedorList } from "../hooks/useProveedorList";
import { useAlmacenList } from "../hooks/useAlmacenList";
import { useInventarioRealtime } from "../hooks/useInventarioRealtime";
import type { Insumo } from "../model/types";

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

const columns = [
  { key: "foto", label: "Foto" },
  { key: "nombre", label: "Nombre" },
  { key: "presentacion", label: "Presentación" },
  { key: "cantidadPresentacion", label: "Cantidad Presentación" },
  { key: "unidadPresentacion", label: "Unidad Presentación" },
  { key: "stock", label: "Stock" },
  { key: "stockTotal", label: "Stock Total" },
  { key: "precioUnitario", label: "Precio por Unidad" },
  { key: "precioTotal", label: "Precio Total Stock" },
  { key: "fechaRegistro", label: "Fecha Registro" },
  { key: "acciones", label: "Acciones" },
];

const ROWS_PER_PAGE = 10;

export default function InventarioPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [categoriaFilter, setCategoriaFilter] = useState<string>("");
  const [proveedorFilter, setProveedorFilter] = useState<string>("");
  const [almacenFilter, setAlmacenFilter] = useState<string>("");

  const { data: insumosResponse, isLoading } = useInsumoList({
    q: q.trim() || undefined,
    page,
    limit: ROWS_PER_PAGE,
    categoriaId: categoriaFilter ? parseInt(categoriaFilter) : undefined,
    proveedorId: proveedorFilter ? parseInt(proveedorFilter) : undefined,
    almacenId: almacenFilter ? parseInt(almacenFilter) : undefined,
  });

  const { data: categorias = [] } = useCategoriaInsumoList();
  const { data: proveedores = [] } = useProveedorList();
  const { data: almacenes = [] } = useAlmacenList();

  // Habilitar actualizaciones en tiempo real
  useInventarioRealtime();

  const insumos = insumosResponse?.items ?? [];
  const total = insumosResponse?.total ?? 0;
  const totalPages = Math.ceil(total / ROWS_PER_PAGE);

  const renderCell = (item: Insumo, columnKey: string) => {
    switch (columnKey) {
      case "foto":
        return item.imagenUrl ? (
          <Image
            src={
              /^(data:|blob:|https?:\/\/)/i.test(item.imagenUrl)
                ? item.imagenUrl
                : `${FILES_BASE.replace(/\/+$/, "")}/${item.imagenUrl.replace(/^\/+/, "")}`
            }
            alt={item.nombre}
            width={40}
            height={40}
            className="object-cover rounded"
            onError={() => console.error('Error loading image')}
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
            N/A
          </div>
        );
      case "nombre":
        return item.nombre ?? "N/A";
      case "presentacion":
        return item.presentacionTipo ?? "N/A";
      case "cantidadPresentacion":
        return item.presentacionCantidad ?? "N/A";
      case "unidadPresentacion":
        return item.presentacionUnidad && item.factorConversion && item.unidadBase
          ? `${item.presentacionUnidad} (${item.factorConversion}${item.unidadBase})`
          : "N/A";
      case "stock":
        return item.stockPresentaciones ? item.stockPresentaciones.toLocaleString() : "N/A";
      case "stockTotal":
        return item.stockTotalPresentacion ? `${item.stockTotalPresentacion.toLocaleString()} ${item.presentacionUnidad}` : "N/A";
      case "precioUnitario":
        return item.precioUnitario ? `$${item.precioUnitario.toLocaleString()}` : "N/A";
      case "precioTotal":
        return item.precioTotal ? `$${item.precioTotal.toLocaleString()}` : "N/A";
      case "fechaRegistro":
        const date = new Date(item.fechaIngreso);
        return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('es-CO');
      case "acciones":
        return (
          <Button
            size="sm"
            variant="flat"
            onPress={() => navigate(`/inventario/${item.id}`)}
          >
            Ver
          </Button>
        );
      default:
        return "";
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Inventario</h1>
          <p className="text-sm opacity-70">Gestión de insumos</p>
        </div>
        <Button
          color="primary"
          onPress={() => navigate("/inventario/crear")}
        >
          Registar Insumo
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Buscar insumos..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <Select
          placeholder="Filtrar por categoría"
          selectedKeys={categoriaFilter ? [categoriaFilter] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setCategoriaFilter(selected);
            setPage(1);
          }}
        >
          {categorias.map((cat) => (
            <SelectItem key={cat.id.toString()}>
              {cat.nombre}
            </SelectItem>
          ))}
        </Select>
        <Select
          placeholder="Filtrar por proveedor"
          selectedKeys={proveedorFilter ? [proveedorFilter] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setProveedorFilter(selected);
            setPage(1);
          }}
        >
          {proveedores.map((prov) => (
            <SelectItem key={prov.id.toString()}>
              {prov.nombre}
            </SelectItem>
          ))}
        </Select>
        <Select
          placeholder="Filtrar por almacén"
          selectedKeys={almacenFilter ? [almacenFilter] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setAlmacenFilter(selected);
            setPage(1);
          }}
        >
          {almacenes.map((alm) => (
            <SelectItem key={alm.id.toString()}>
              {alm.nombre}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table aria-label="Tabla de insumos">
          <TableHeader columns={columns}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={insumos} isLoading={isLoading} emptyContent="No hay insumos">
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            page={page}
            total={totalPages}
            onChange={setPage}
            showShadow
          />
        </div>
      )}
    </div>
  );
}