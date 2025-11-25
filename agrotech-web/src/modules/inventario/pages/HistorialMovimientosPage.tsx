import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { useMovimientoList } from "../hooks/useMovimientoList";
import { useAllInsumoHistory } from "../hooks/useInsumoHistory";
import { useInsumoList } from "../hooks/useInsumoList";
import { useInventarioRealtime } from "../hooks/useInventarioRealtime";
import type { MovimientoInventario } from "../model/types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { DateValue } from "@internationalized/date";

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "tipo", label: "Tipo" },
  { key: "insumo", label: "Insumo" },
  { key: "accion", label: "Acción" },
  { key: "responsable", label: "Responsable" },
  { key: "descripcion", label: "Descripción" },
  { key: "detalles", label: "Detalles" },
  { key: "acciones", label: "Acciones" },
];

export default function HistorialMovimientosPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    insumoId: "",
    accion: "",
    fechaDesde: null as DateValue | null,
    fechaHasta: null as DateValue | null,
  });

  const { data: movimientos = [], isLoading: movimientosLoading } = useMovimientoList({
    q: q.trim() || undefined,
  });

  const { data: allHistory = [], isLoading: historyLoading } = useAllInsumoHistory();

  const { data: insumosData } = useInsumoList();
  const insumos = insumosData?.items || [];

  // Habilitar actualizaciones en tiempo real
  useInventarioRealtime();

  // Combinar movimientos y historial en un solo array ordenado por fecha
  const combinedHistory = useMemo(() => {
    const combined = [
      // Movimientos de inventario
      ...movimientos.map((mov: MovimientoInventario) => ({
        id: `mov-${mov.id}`,
        type: 'movimiento' as const,
        fecha: mov.fechaMovimiento,
        insumo: mov.insumo.nombre,
        insumoId: mov.insumo.id,
        accion: mov.tipoMovimiento === 'ajuste' ? 'actualizado' : mov.tipoMovimiento,
        responsable: mov.usuarioResponsable?.nombre || 'Sistema',
        descripcion: mov.descripcion,
        detalles: {
          cantidadPresentaciones: mov.cantidadPresentaciones,
          cantidadBase: mov.cantidadBase,
          valorMovimiento: mov.valorMovimiento,
          origen: mov.origen
        },
        cambios: null
      })),
      // Historial de acciones
      ...allHistory.map((item: any) => ({
        id: `hist-${item.id}`,
        type: 'historial' as const,
        fecha: item.fecha,
        insumo: item.insumo?.nombre_insumo || 'N/A',
        insumoId: item.insumoId,
        accion: item.accion?.toLowerCase() === 'crear' ? 'creado' :
                item.accion?.toLowerCase() === 'editar' ? 'actualizado' :
                item.accion?.toLowerCase() || 'desconocida',
        responsable: item.usuario ? `${item.usuario.nombre_usuario} ${item.usuario.apellido_usuario}` : 'Sistema',
        descripcion: item.descripcion || '',
        detalles: null,
        cambios: item.cambios
      }))
    ];

    // Aplicar filtros
    let filtered = combined;

    // Filtro por búsqueda de texto
    if (q.trim()) {
      const searchTerm = q.toLowerCase();
      filtered = filtered.filter(item =>
        item.insumo.toLowerCase().includes(searchTerm) ||
        item.accion.toLowerCase().includes(searchTerm) ||
        item.responsable.toLowerCase().includes(searchTerm) ||
        item.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por tipo
    if (filters.tipo) {
      filtered = filtered.filter(item => item.type === filters.tipo);
    }

    // Filtro por insumo
    if (filters.insumoId) {
      filtered = filtered.filter(item => item.insumoId.toString() === filters.insumoId);
    }

    // Filtro por acción
    if (filters.accion) {
      filtered = filtered.filter(item => item.accion === filters.accion);
    }

    // Filtro por fecha desde
    if (filters.fechaDesde) {
      const fechaDesdeDate = new Date(filters.fechaDesde.year, filters.fechaDesde.month - 1, filters.fechaDesde.day);
      filtered = filtered.filter(item => new Date(item.fecha) >= fechaDesdeDate);
    }

    // Filtro por fecha hasta
    if (filters.fechaHasta) {
      const fechaHastaDate = new Date(filters.fechaHasta.year, filters.fechaHasta.month - 1, filters.fechaHasta.day);
      filtered = filtered.filter(item => new Date(item.fecha) <= fechaHastaDate);
    }

    // Ordenar por fecha descendente (más reciente primero)
    return filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [movimientos, allHistory, q, filters]);

  const isLoading = movimientosLoading || historyLoading;

  const handleVerDetalleInsumo = (insumoId: number) => {
    navigate(`/inventario/${insumoId}`);
  };

  const renderCell = (item: any, columnKey: string) => {
    switch (columnKey) {
      case "fecha":
        return item.fecha ? new Date(item.fecha).toLocaleString('es-CO') : "N/A";
      case "tipo":
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            item.type === 'movimiento'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {item.type === 'movimiento' ? 'Movimiento' : 'Acción'}
          </span>
        );
      case "insumo":
        return item.insumo;
      case "accion":
        return item.accion;
      case "responsable":
        return item.responsable;
      case "descripcion":
        return item.descripcion;
      case "detalles":
        if (item.type === 'movimiento' && item.detalles) {
          return (
            <div className="text-xs space-y-1">
              <div><span className="font-medium">Cant. Present.:</span> {item.detalles.cantidadPresentaciones}</div>
              <div><span className="font-medium">Cant. Base:</span> {item.detalles.cantidadBase}</div>
              {item.detalles.valorMovimiento && (
                <div><span className="font-medium">Valor:</span> ${item.detalles.valorMovimiento.toLocaleString()}</div>
              )}
              <div><span className="font-medium">Origen:</span> {item.detalles.origen}</div>
            </div>
          );
        } else if (item.type === 'historial' && item.cambios) {
          return (
            <div className="text-xs space-y-1">
              {Object.entries(item.cambios).map(([key, change]: [string, any]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {change.antes || 'N/A'} → {change.despues || 'N/A'}
                </div>
              ))}
            </div>
          );
        }
        return "-";
      case "acciones":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              onClick={() => handleVerDetalleInsumo(item.insumoId)}
            >
              Ver Detalle
            </Button>
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Historial Completo</h1>
          <p className="text-sm opacity-70">Historial de movimientos y acciones de inventario</p>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar movimientos..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Filtros avanzados */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Filtros Avanzados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtro por tipo */}
          <Select
            label="Tipo"
            placeholder="Seleccionar tipo"
            selectedKeys={filters.tipo ? [filters.tipo] : []}
            onSelectionChange={(keys) => setFilters(prev => ({ ...prev, tipo: Array.from(keys)[0] as string }))}
          >
            <SelectItem key="">Todos</SelectItem>
            <SelectItem key="movimiento">Movimiento</SelectItem>
            <SelectItem key="historial">Historial</SelectItem>
          </Select>

          {/* Filtro por insumo */}
          <Select
            label="Insumo"
            placeholder="Seleccionar insumo"
            selectedKeys={filters.insumoId ? [filters.insumoId] : []}
            onSelectionChange={(keys) => setFilters(prev => ({ ...prev, insumoId: Array.from(keys)[0] as string }))}
          >
            <SelectItem key="">Todos</SelectItem>
            <>{insumos.map((insumo) => (
              <SelectItem key={insumo.id}>
                {insumo.nombre}
              </SelectItem>
            ))}</>
          </Select>

          {/* Filtro por acción */}
          <Select
            label="Acción"
            placeholder="Seleccionar acción"
            selectedKeys={filters.accion ? [filters.accion] : []}
            onSelectionChange={(keys) => setFilters(prev => ({ ...prev, accion: Array.from(keys)[0] as string }))}
          >
            <SelectItem key="">Todas</SelectItem>
            <SelectItem key="entrada">Entrada</SelectItem>
            <SelectItem key="salida">Salida</SelectItem>
            <SelectItem key="actualizado">Actualizado</SelectItem>
            <SelectItem key="creado">Creado</SelectItem>
            <SelectItem key="eliminado">Eliminado</SelectItem>
          </Select>

          {/* Filtro por fecha desde */}
          <DatePicker
            label="Fecha desde"
            value={filters.fechaDesde}
            onChange={(date) => setFilters(prev => ({ ...prev, fechaDesde: date }))}
          />

          {/* Filtro por fecha hasta */}
          <DatePicker
            label="Fecha hasta"
            value={filters.fechaHasta}
            onChange={(date) => setFilters(prev => ({ ...prev, fechaHasta: date }))}
          />
        </div>

        {/* Botón para limpiar filtros */}
        <div className="mt-4 flex justify-end">
          <Button
            color="secondary"
            variant="flat"
            onClick={() => setFilters({
              tipo: "",
              insumoId: "",
              accion: "",
              fechaDesde: null,
              fechaHasta: null,
            })}
            startContent={<XMarkIcon className="w-4 h-4" />}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      <Table aria-label="Tabla de historial completo">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={combinedHistory} isLoading={isLoading} emptyContent="No hay registros">
          {(item) => (
            <TableRow key={item.id} className={item.type === 'movimiento' ? 'bg-blue-50' : 'bg-green-50'}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}