import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Button,
  Divider,
  Switch,
} from "@heroui/react";
import { Wifi, Server, Search, RefreshCcw } from "lucide-react";
import api, { connectSocket } from "@/shared/api/client";

/* =========================
 * Tipos (alineados a tu backend)
 * ========================= */
type TipoSensor = {
  id_tipo_sensor_pk: number;
  nombre_tipo_sensor: string;
  unidades?: string | null;
};

type Lote = {
  id_lote_pk: number;
  nombre_lote?: string | null;
  codigo?: string | null;
};

type Sensor = {
  id_sensor_pk: number;
  nombre_sensor: string;
  activo: boolean;
  broker_sensor: string;
  puerto_sensor: number;
  topico_sensor: string;
  ultimo_valor: number | null;
  ultima_medicion: string | null; // llega como ISO
  tipo_sensor: TipoSensor;
  lote: Lote;
};

/* =========================
 * Utils pequeños
 * ========================= */
function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  // HH:mm:ss · YYYY-MM-DD
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} · ${d.getFullYear()}-${pad(
    d.getMonth() + 1
  )}-${pad(d.getDate())}`;
}

function includesI(s: string, q: string) {
  return s.toLowerCase().includes(q.toLowerCase());
}

/* =========================
 * Page
 * ========================= */
export default function SensoresLivePage() {
  const [loading, setLoading] = useState(true);
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [query, setQuery] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);

  // Guardamos un mapa para acceso rápido por id
  const sensoresMapRef = useRef<Map<number, Sensor>>(new Map());

  // =========== Cargar lista inicial ===========
  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Sensor[]>("/sensores");
      setSensores(data);
      const m = new Map<number, Sensor>();
      data.forEach((s) => m.set(s.id_sensor_pk, s));
      sensoresMapRef.current = m;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // =========== WebSocket live ===========
  useEffect(() => {
    const s = connectSocket("/sensores");

    const onCreated = (sensor: Sensor) => {
      sensoresMapRef.current.set(sensor.id_sensor_pk, sensor);
      setSensores((prev) => {
        const exists = prev.some((x) => x.id_sensor_pk === sensor.id_sensor_pk);
        return exists ? prev.map((x) => (x.id_sensor_pk === sensor.id_sensor_pk ? sensor : x)) : [sensor, ...prev];
      });
    };

    const onUpdated = (sensor: Sensor) => {
      sensoresMapRef.current.set(sensor.id_sensor_pk, sensor);
      setSensores((prev) => prev.map((x) => (x.id_sensor_pk === sensor.id_sensor_pk ? sensor : x)));
    };

    const onRemoved = ({ id }: { id: number }) => {
      sensoresMapRef.current.delete(id);
      setSensores((prev) => prev.filter((x) => x.id_sensor_pk !== id));
    };

    const onRestored = (sensor: Sensor) => {
      sensoresMapRef.current.set(sensor.id_sensor_pk, sensor);
      setSensores((prev) => {
        const exists = prev.some((x) => x.id_sensor_pk === sensor.id_sensor_pk);
        return exists ? prev.map((x) => (x.id_sensor_pk === sensor.id_sensor_pk ? sensor : x)) : [sensor, ...prev];
      });
    };

    s.on("sensores:created", onCreated);
    s.on("sensores:updated", onUpdated);
    s.on("sensores:removed", onRemoved);
    s.on("sensores:restored", onRestored);

    return () => {
      s.off("sensores:created", onCreated);
      s.off("sensores:updated", onUpdated);
      s.off("sensores:removed", onRemoved);
      s.off("sensores:restored", onRestored);
      // NO desconectamos el socket global porque lo reutilizas en más páginas
    };
  }, []);

  // =========== Filtro simple ===========
  const filtered = useMemo(() => {
    const q = query.trim();
    return sensores.filter((s) => {
      if (soloActivos && !s.activo) return false;
      if (!q) return true;
      const cols = [
        s.nombre_sensor || "",
        s.tipo_sensor?.nombre_tipo_sensor || "",
        s.lote?.nombre_lote || s.lote?.codigo || "",
        s.topico_sensor || "",
        s.broker_sensor || "",
        String(s.puerto_sensor || ""),
      ].join(" | ");
      return includesI(cols, q);
    });
  }, [sensores, query, soloActivos]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Card shadow="sm" className="border border-default-100 bg-content1/60 backdrop-blur">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-semibold">Sensores · Datos en tiempo real</h2>
              <p className="text-small text-default-500">
                Se actualiza cuando el backend emite <code>sensores:updated</code>.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <Input
              size="sm"
              variant="bordered"
              startContent={<Search className="w-4 h-4" />}
              placeholder="Buscar por nombre, tipo, lote, tópico, broker…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Switch isSelected={soloActivos} onValueChange={setSoloActivos}>
                Solo activos
              </Switch>
              <Button size="sm" variant="flat" startContent={<RefreshCcw className="w-4 h-4" />} onPress={fetchAll} isDisabled={loading}>
                Recargar
              </Button>
            </div>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="overflow-x-auto">
          <Table aria-label="tabla-sensores" removeWrapper>
            <TableHeader>
              <TableColumn>Sensor</TableColumn>
              <TableColumn>Tipo</TableColumn>
              <TableColumn>Lote</TableColumn>
              <TableColumn>Último valor</TableColumn>
              <TableColumn>Medición</TableColumn>
              <TableColumn>Broker</TableColumn>
              <TableColumn>Puerto</TableColumn>
              <TableColumn>Tópico</TableColumn>
              <TableColumn className="text-center">Estado</TableColumn>
            </TableHeader>

            <TableBody
              emptyContent={loading ? "Cargando…" : "Sin resultados"}
              items={filtered}
            >
              {(s: Sensor) => (
                <TableRow key={s.id_sensor_pk}>
                  <TableCell className="max-w-[220px]">
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="flat">
                        #{s.id_sensor_pk}
                      </Chip>
                      <div className="truncate">{s.nombre_sensor}</div>
                    </div>
                  </TableCell>

                  <TableCell className="capitalize">
                    {s.tipo_sensor?.nombre_tipo_sensor ?? "—"}
                    {s.tipo_sensor?.unidades ? (
                      <span className="text-default-500"> ({s.tipo_sensor.unidades})</span>
                    ) : null}
                  </TableCell>

                  <TableCell>
                    {s.lote?.nombre_lote || s.lote?.codigo || "—"}
                  </TableCell>

                  <TableCell>
                    {s.ultimo_valor ?? "—"}
                    {s.tipo_sensor?.unidades ? (
                      <span className="text-default-500"> {s.tipo_sensor.unidades}</span>
                    ) : null}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(s.ultima_medicion)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Server className="w-4 h-4" />
                      <Tooltip content={s.broker_sensor}>
                        <span className="truncate max-w-[140px] inline-block align-bottom">
                          {s.broker_sensor}
                        </span>
                      </Tooltip>
                    </div>
                  </TableCell>

                  <TableCell>{s.puerto_sensor ?? "—"}</TableCell>

                  <TableCell className="max-w-[220px]">
                    <Tooltip content={s.topico_sensor}>
                      <span className="truncate inline-block max-w-[210px]">{s.topico_sensor}</span>
                    </Tooltip>
                  </TableCell>

                  <TableCell className="text-center">
                    {s.activo ? (
                      <Chip size="sm" color="success" variant="flat">
                        Activo
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="flat">Inactivo</Chip>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
