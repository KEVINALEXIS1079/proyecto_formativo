// src/modules/iot/TipoSensor/ui/TipoSensorTable.tsx
import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { Edit3, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { TipoSensor } from "../model/types";
import ImagePreview from "./ImagePreview";

type Props = {
  data?: TipoSensor[];
  deleted?: boolean;
  loading?: boolean;
  onCreate?: () => void;
  onEdit?: (row: TipoSensor) => void;
  onRemove?: (row: TipoSensor) => void;
  onRestore?: (row: TipoSensor) => void;
};

// Formatea decimales dinámicamente respetando hasta 6 decimales exactos
function formatExactDecimal(value: number | string | null | undefined) {
  if (value == null) return "—";

  // Si viene como string, lo limpiamos y limitamos a 6 decimales
  if (typeof value === "string") {
    const parts = value.split(".");
    if (parts.length === 2) {
      return parts[0] + "." + parts[1].slice(0, 6);
    }
    return parts[0]; // entero
  }

  // Si es número, convertir a string con hasta 6 decimales reales
  const str = value.toString();
  const match = str.match(/^(\d+)(?:\.(\d+))?/);
  if (!match) return "—";
  const integerPart = match[1];
  const decimalPart = match[2] ? match[2].slice(0, 6) : "";
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

export default function TipoSensorTable({
  data,
  deleted = false,
  loading,
  onCreate,
  onEdit,
  onRemove,
  onRestore,
}: Props) {
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const txt = q.trim().toLowerCase();
    if (!txt) return data ?? [];
    return (data ?? []).filter((r) =>
      [
        r.nombre_tipo_sensor,
        r.unidades_tipo_sensor ?? "",
        formatExactDecimal(r.decimales_tipo_sensor),
      ]
        .join(" ")
        .toLowerCase()
        .includes(txt)
    );
  }, [data, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {!deleted && (
            <Button
              color="primary"
              startContent={<Plus size={16} />}
              onPress={onCreate}
            >
              Nuevo tipo
            </Button>
          )}
          <Chip variant="flat" color={deleted ? "danger" : "success"}>
            {deleted ? "Eliminados" : "Activos"}
          </Chip>
        </div>

        <Input
          className="max-w-xs"
          placeholder="Buscar por nombre, unidad o decimales"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          isClearable
          onClear={() => setQ("")}
        />
      </div>

      <Table aria-label="Tabla de tipos de sensor" isStriped removeWrapper>
        <TableHeader>
          <TableColumn>Imagen</TableColumn>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>Unidades</TableColumn>
          <TableColumn>Decimales</TableColumn>
          <TableColumn className="w-40 text-right">Acciones</TableColumn>
        </TableHeader>

        <TableBody
          items={items}
          emptyContent={loading ? "Cargando..." : "Sin registros"}
        >
          {(row: TipoSensor) => (
            <TableRow key={row.id_tipo_sensor_pk}>
              <TableCell>
                <ImagePreview src={row.imagen_tipo_sensor || undefined} />
              </TableCell>
              <TableCell className="font-medium">
                {row.nombre_tipo_sensor}
              </TableCell>
              <TableCell>
                {row.unidades_tipo_sensor || (
                  <span className="text-foreground-400">—</span>
                )}
              </TableCell>
              <TableCell>
                {row.decimales_tipo_sensor != null ? (
                  formatExactDecimal(row.decimales_tipo_sensor)
                ) : (
                  <span className="text-foreground-400">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {!deleted ? (
                  <div className="flex justify-end gap-2">
                    <Tooltip content="Editar">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={() => onEdit?.(row)}
                      >
                        <Edit3 size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip color="danger" content="Eliminar">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => onRemove?.(row)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Tooltip>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Tooltip color="success" content="Restaurar">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="success"
                        onPress={() => onRestore?.(row)}
                      >
                        <RotateCcw size={16} />
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
