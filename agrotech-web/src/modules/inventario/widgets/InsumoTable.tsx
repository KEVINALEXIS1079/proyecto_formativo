import type { Insumo } from "../model/types";
import { formatCurrency } from "@/shared/utils/formatters";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Image,
} from "@heroui/react";
import { Eye, Edit, History, Trash2 } from "lucide-react";
import Surface from "../../users/ui/Surface";

interface InsumoTableProps {
  insumos: Insumo[];
  isLoading: boolean;
  onView?: (insumo: Insumo) => void;
  onEdit?: (insumo: Insumo) => void;
  onDelete?: (insumo: Insumo) => void;
  onViewMovimientos?: (insumo: Insumo) => void;
  hasMovimientosMap: Map<number, boolean>;
}

const FILES_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace("/api/v1", "");

export const InsumoTable = ({
  insumos,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onViewMovimientos,
  hasMovimientosMap,
}: InsumoTableProps) => {
  if (isLoading) {
    return <div className="p-4 text-center">Cargando insumos...</div>;
  }

  if (!insumos.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay insumos registrados.
      </div>
    );
  }

  return (
    <Surface>
      <Table
        aria-label="Tabla de insumos"
        removeWrapper
        className="[&_[data-slot=td]]:py-3"
      >
        <TableHeader>
          <TableColumn>IMAGEN</TableColumn>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>CATEGORÍA</TableColumn>
          <TableColumn>PROVEEDOR</TableColumn>
          <TableColumn>ALMACÉN</TableColumn>
          <TableColumn align="end">STOCK</TableColumn>
          <TableColumn align="end">PRECIO</TableColumn>
          <TableColumn align="end">ACCIONES</TableColumn>
        </TableHeader>
        <TableBody items={insumos}>
          {(insumo) => (
            <TableRow
              key={insumo.id || `insumo-${Math.random()}`}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <TableCell>
                {insumo.imagenUrl ? (
                  <Image
                    src={
                      /^(data:|blob:|https?:\/\/)/i.test(insumo.imagenUrl)
                        ? insumo.imagenUrl
                        : `${FILES_BASE.replace(
                          /\/+$/,
                          ""
                        )}/${insumo.imagenUrl.replace(/^\/+/, "")}`
                    }
                    alt={insumo.nombre}
                    width={40}
                    height={40}
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
                    N/A
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">
                    {insumo.nombre}
                  </div>
                  <div className="text-xs text-gray-500">
                    {insumo.descripcion}
                  </div>
                </div>
              </TableCell>
              <TableCell>{insumo.categoria?.nombre || "-"}</TableCell>
              <TableCell>{insumo.proveedor?.nombre || "-"}</TableCell>
              <TableCell>{insumo.almacen?.nombre || "-"}</TableCell>
              <TableCell>
                <div className="text-sm text-right">
                  <div>
                    {insumo.stockPresentaciones} {insumo.presentacionUnidad}
                  </div>
                  <div className="text-xs text-gray-500">
                    {insumo.stockTotalPresentacion} total
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-right">
                  <div>{formatCurrency(insumo.precioUnitarioUso || 0)}</div>
                  <div className="text-xs text-gray-500">por unidad</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-gray-600"
                      onPress={() => onView(insumo)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="light"
                      className="text-[#17C964]"
                      onPress={() => onEdit(insumo)}
                      startContent={<Edit className="h-4 w-4" />}
                    >
                      Editar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    isIconOnly
                    onPress={() => onDelete && onDelete(insumo)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {onViewMovimientos && hasMovimientosMap.get(insumo.id) && (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="text-blue-600"
                      onPress={() => onViewMovimientos(insumo)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Surface>
  );
};
