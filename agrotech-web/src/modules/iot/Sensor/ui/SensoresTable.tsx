// src/modules/iot/sensores/ui/SensoresTable.tsx
import { useMemo } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Tooltip, Progress, Chip
} from "@heroui/react";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { Sensor } from "../api/sensor.service";

type Props = {
  data?: Sensor[];
  loading?: boolean;
  onCreate?: () => void;
  onEdit?: (row: Sensor) => void;
  onRemove?: (row: Sensor) => void;
  onRestore?: (row: Sensor) => void;
  onSelect?: (id: number) => void;
  selectedId?: number | null;
  deleted?: boolean;
};

const toPercent = (v?: number | null, lo?: number | null, hi?: number | null) => {
  if (v == null) return 0;
  const a = lo ?? 0, b = hi ?? 100;
  if (a === b) return 0;
  return Math.max(0, Math.min(100, Math.round(((v - a) / (b - a)) * 100)));
};

const pickColor = (v?: number | null, lo?: number | null, hi?: number | null) => {
  if (v == null) return "default" as const;
  const a = lo ?? 0, b = hi ?? 100;
  if (v < a || v > b) return "danger" as const;
  const edge = (b - a || 1) * 0.1;
  if (v - a < edge || b - v < edge) return "warning" as const;
  return "success" as const;
};

export default function SensoresTable({
  data = [],
  loading,
  onEdit,
  onRemove,
  onRestore,
  onSelect,
  selectedId,
  deleted = false,
}: Props) {
  const rows = useMemo(() => data, [data]);

  return (
    <Table
      aria-label="Listado de sensores"
      selectionMode="single"
      selectedKeys={selectedId ? new Set([String(selectedId)]) : new Set()}
      onSelectionChange={(keys) => {
        const id = Array.from(keys as Set<string>)[0];
        if (id && onSelect) onSelect(Number(id));
      }}
      isHeaderSticky
      removeWrapper
    >
      <TableHeader>
        <TableColumn>Sensor</TableColumn>
        <TableColumn>Tipo</TableColumn>
        <TableColumn>Lote</TableColumn>
        <TableColumn>Último valor</TableColumn>
        <TableColumn>Medición</TableColumn>
        <TableColumn>Broker</TableColumn>
        <TableColumn>Puerto</TableColumn>
        <TableColumn>Tópico</TableColumn>
        <TableColumn align="center">Acciones</TableColumn>
      </TableHeader>

      <TableBody
        items={rows}
        emptyContent={loading ? "Cargando…" : "Sin sensores"}
        isLoading={loading}
      >
        {(row) => {
          const unidad = row.tipo_sensor?.unidades_tipo_sensor ?? "";
          const decPattern = row.tipo_sensor?.decimales_tipo_sensor ?? "0";
          const dot = decPattern.includes(".") ? decPattern.length - decPattern.indexOf(".") - 1 : 0;

          const p = toPercent(row.ultimo_valor, row.valor_minimo_sensor, row.valor_maximo_sensor);
          const c = pickColor(row.ultimo_valor, row.valor_minimo_sensor, row.valor_maximo_sensor);

          return (
            <TableRow key={row.id_sensor_pk}>
              <TableCell>{row.nombre_sensor}</TableCell>
              <TableCell>
                {row.tipo_sensor?.nombre_tipo_sensor ?? "—"}
                {unidad ? <span className="text-default-500"> ({unidad})</span> : null}
              </TableCell>
              <TableCell>{row.lote?.nombre_lote || row.lote?.codigo || "—"}</TableCell>

              {/* Último valor + barrita de progreso */}
              <TableCell className="min-w-[160px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">
                    {row.ultimo_valor == null ? "—" : `${row.ultimo_valor.toFixed(dot)}${unidad}`}
                  </span>
                  <Chip size="sm" variant="flat" color={c as any} className="min-w-[46px]" radius="md">
                    {p}%
                  </Chip>
                </div>
                <Progress
                  aria-label="Porcentaje del rango"
                  value={p}
                  color={c as any}
                  size="sm"
                  showValueLabel={false}
                  className="mt-1"
                  classNames={{
                    track: "h-1",
                  }}
                />
              </TableCell>

              <TableCell>{row.ultima_medicion ? new Date(row.ultima_medicion).toLocaleString() : "—"}</TableCell>
              <TableCell>{row.broker_sensor}</TableCell>
              <TableCell>{row.puerto_sensor}</TableCell>
              <TableCell className="truncate max-w-[280px]">{row.topico_sensor}</TableCell>

              <TableCell>
                <div className="flex gap-2 justify-end">
                  {!deleted ? (
                    <>
                      <Tooltip content="Editar">
                        <Button isIconOnly size="sm" variant="flat" onPress={() => onEdit?.(row)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip color="danger" content="Eliminar">
                        <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => onRemove?.(row)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip content="Restaurar">
                      <Button isIconOnly size="sm" variant="flat" onPress={() => onRestore?.(row)}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
