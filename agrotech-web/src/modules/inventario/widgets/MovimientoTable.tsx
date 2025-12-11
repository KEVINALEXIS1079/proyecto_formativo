import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Spinner
} from "@heroui/react";
import { Eye } from "lucide-react";
import Surface from "../../users/ui/Surface";
import { formatCurrency } from "@/shared/utils/formatters";
import type { MovimientoInventario } from "../model/types";

interface MovimientoTableProps {
  movimientos: MovimientoInventario[];
  isLoading: boolean;
  onManage?: (movimiento: MovimientoInventario) => void;
}

const getTipoColor = (tipo: string) => {
  const normalized = tipo?.toLowerCase() || "";
  if (normalized.includes("entrada")) return "success";
  if (normalized.includes("salida")) return "danger";
  return "default";
};

export const MovimientoTable = ({
  movimientos,
  isLoading,
  onManage,
}: MovimientoTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner color="success" label="Cargando movimientos..." />
      </div>
    );
  }

  if (!movimientos.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay movimientos registrados.
      </div>
    );
  }

  return (
    <Surface>
      <Table
        aria-label="Tabla de movimientos"
        removeWrapper
        className="[&_[data-slot=td]]:py-4 [&_[data-slot=th]]:py-3 [&_[data-slot=td]]:px-4 [&_[data-slot=th]]:px-4"
        fullWidth
      >
        <TableHeader>
          <TableColumn className="w-20">TIPO</TableColumn>
          <TableColumn className="w-32">FECHA</TableColumn>
          <TableColumn className="w-48">INSUMO</TableColumn>
          <TableColumn className="w-28" align="end">CANT. PRES.</TableColumn>
          <TableColumn className="w-28" align="end">CANT. BASE</TableColumn>
          <TableColumn className="w-24" align="end">VALOR</TableColumn>
          <TableColumn className="w-32">USUARIO</TableColumn>
          <TableColumn>DESCRIPCIÓN</TableColumn>
          <TableColumn className="w-16" align="end">
            ACCIONES
          </TableColumn>
        </TableHeader>
        <TableBody items={movimientos}>
          {(movimiento) => (
            <TableRow
              key={movimiento.id}
              className="hover:bg-gray-50/80 transition-colors"
            >
              <TableCell>
                <Chip
                  color={getTipoColor(movimiento.tipoMovimiento)}
                  variant="flat"
                  size="sm"
                  className="font-medium"
                >
                  {movimiento.tipoMovimiento}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="text-sm font-medium">
                  {new Date(movimiento.fechaMovimiento).toLocaleDateString(
                    "es-CO",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(movimiento.fechaMovimiento).toLocaleTimeString(
                    "es-CO",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div
                    className="font-medium text-gray-900 truncate max-w-[180px]"
                    title={movimiento.insumo?.nombre}
                  >
                    {movimiento.insumo?.nombre || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {movimiento.insumo?.id || "N/A"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm font-mono text-right">
                  {movimiento.cantidadPresentaciones?.toLocaleString() || "0"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm font-mono text-right">
                  {movimiento.cantidadBase?.toLocaleString() || "0"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm font-semibold text-right">
                  {formatCurrency(movimiento.valorMovimiento || 0)}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div
                    className="truncate max-w-[120px]"
                    title={movimiento.usuarioResponsable?.nombreUsuario || "N/A"}
                  >
                    {movimiento.usuarioResponsable?.nombreUsuario || "N/A"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm max-w-[300px]">
                  <div
                    className="line-clamp-2 leading-relaxed"
                    title={movimiento.descripcion}
                  >
                    {movimiento.descripcion || "-"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  {onManage && (
                    <Button
                      size="sm"
                      color="success"
                      isIconOnly
                      className="text-black"
                      onPress={() => onManage(movimiento)}
                      title="Gestionar"
                    >
                      <Eye className="h-4 w-4" />
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