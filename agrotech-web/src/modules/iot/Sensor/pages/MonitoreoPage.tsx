// src/modules/iot/sensores/pages/MonitoreoPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Switch, Button, Input } from "@heroui/react";
import { Wifi, RefreshCcw, Layers, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useSensoresList,
  useSensorRealtime,
  useCreateSensor,
  useUpdateSensor,
  useRemoveSensor,
  useRestoreSensor,
} from "../hooks/useSensores";
import { useSensorHistorialInfinite } from "../hooks/useSensorHistorialInfinite";
import { useCreateTipoSensor, useTiposSensor } from "../../TipoSensor/hooks";
import { sensorService, socketSensores } from "../api/sensor.service";
import type { Sensor } from "../api/sensor.service";

import { SensorRealtimePanel } from "../ui";
import SensoresTable from "../ui/SensoresTable";
import SensorForm from "../ui/SensorForm";
import TipoSensorForm from "../../TipoSensor/ui/TipoSensorForm";
import { throttle } from "../utils/throttle";

type Point = { ts: number; v: number };

const MAX_POINTS = 1000;
const ROTATE_MS = 7000;

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

export default function MonitoreoPage() {
  const navigate = useNavigate();

  // Estados
  const [query, setQuery] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isHover, setIsHover] = useState(false);

  // Lista + refetch + realtime
  const { data: activos, isLoading: loadingList, refetch } = useSensoresList();
  useSensorRealtime();

  // ===== Orden estable de filas de la tabla =====
  // Se fija con la primera llegada y se mantiene; nuevos sensores se agregan al final.
  const orderRef = useRef<number[]>([]);
  useEffect(() => {
    if (!activos) return;
    const incomingIds = activos.map((s) => s.id_sensor_pk);
    const current = orderRef.current;

    // Mantén los que siguen existiendo
    const keep = current.filter((id) => incomingIds.includes(id));
    // Agrega al final los nuevos
    const add = incomingIds.filter((id) => !current.includes(id));
    orderRef.current = [...keep, ...add];
  }, [activos]);

  const orderIndex = useMemo(() => {
    const m = new Map<number, number>();
    orderRef.current.forEach((id, i) => m.set(id, i));
    return m;
  }, [activos]);

  // Historial en memoria para la gráfica
  const historyRef = useRef<Map<number, Point[]>>(new Map());
  const pushPoint = (id: number, p: Point) => {
    if (!Number.isFinite(p.ts)) return;
    const arr = historyRef.current.get(id) ?? [];
    arr.push(p);
    if (arr.length > MAX_POINTS) arr.splice(0, arr.length - MAX_POINTS);
    historyRef.current.set(id, arr);
  };

  const [tick, setTick] = useState(0);
  const bump = useMemo(() => throttle(() => setTick((t) => (t + 1) % 1_000_000), 400), []);

  // Carga inicial para sembrar histórico y selección
  useEffect(() => {
    (async () => {
      const data = await sensorService.list();
      const now = Date.now();
      data.forEach((s) => {
        if (s.ultimo_valor != null) {
          const ts = s.ultima_medicion ? Date.parse(s.ultima_medicion) : now;
          pushPoint(s.id_sensor_pk, { ts, v: s.ultimo_valor! });
        }
      });
      if (!selectedId && data.length) {
        const first = data.find((x) => x.activo) ?? data[0];
        setSelectedId(first.id_sensor_pk);
      }
      bump();
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket solo para ir acumulando puntos (no cambia el orden de la tabla)
  useEffect(() => {
    const s = socketSensores();
    const onUpsert = (sensor: Sensor) => {
      if (sensor.ultimo_valor != null) {
        const ts = sensor.ultima_medicion ? Date.parse(sensor.ultima_medicion) : Date.now();
        pushPoint(sensor.id_sensor_pk, { ts, v: sensor.ultimo_valor });
        bump();
      }
    };
    s.on("sensores:created", onUpsert);
    s.on("sensores:updated", onUpsert);
    s.on("sensores:restored", onUpsert);
    return () => {
      s.off("sensores:created", onUpsert);
      s.off("sensores:updated", onUpsert);
      s.off("sensores:restored", onUpsert);
    };
  }, [bump]);

  // Filtro + ORDEN ESTABLE
  const filtered = useMemo<Sensor[]>(() => {
    const q = query.trim().toLowerCase();
    const base = (activos || []).filter((s) => (soloActivos ? s.activo : true));
    const list = !q
      ? base
      : base.filter((s) =>
          [
            s.nombre_sensor,
            s.tipo_sensor?.nombre_tipo_sensor,
            s.lote?.nombre_lote || s.lote?.codigo,
            s.topico_sensor,
            s.broker_sensor,
            String(s.puerto_sensor),
          ]
            .join("|")
            .toLowerCase()
            .includes(q)
        );

    // aplica orden estable
    return list.slice().sort((a, b) => {
      const ia = orderIndex.get(a.id_sensor_pk) ?? Number.MAX_SAFE_INTEGER;
      const ib = orderIndex.get(b.id_sensor_pk) ?? Number.MAX_SAFE_INTEGER;
      return ia - ib;
    });
  }, [activos, query, soloActivos, orderIndex]);

  const selected = useMemo<Sensor | null>(
    () => filtered.find((x) => x.id_sensor_pk === selectedId) || filtered[0] || null,
    [filtered, selectedId]
  );

  // Rotación automática del foco del panel
  useEffect(() => {
    if (!autoRotate || isHover) return;
    if (!filtered?.length || filtered.length < 2) return;
    const handle = setInterval(() => {
      const idx = selected ? filtered.findIndex((x) => x.id_sensor_pk === selected.id_sensor_pk) : -1;
      const nextIdx = (idx + 1) % filtered.length;
      setSelectedId(filtered[nextIdx].id_sensor_pk);
    }, ROTATE_MS);
    return () => clearInterval(handle);
  }, [autoRotate, isHover, filtered, selected?.id_sensor_pk]);

  // Historial infinito (REST) para el panel
  const pageSize = 120;
  const hist = useSensorHistorialInfinite(selected?.id_sensor_pk, pageSize);

  useEffect(() => {
    const id = selected?.id_sensor_pk;
    if (!id) return;
    const pagesDesc = (hist.data as any)?.pages ?? [];
    const desc = pagesDesc.flat?.() ?? [];
    const asc: Point[] = [...desc]
      .reverse()
      .map((h: any) => ({ ts: Date.parse(h.fecha), v: h.valor }))
      .filter((p) => Number.isFinite(p.ts));
    historyRef.current.set(id, asc);
  }, [selected?.id_sensor_pk, hist.data]);

  const selectedHistory = useMemo(() => {
    if (!selected) return [] as Point[];
    return historyRef.current.get(selected.id_sensor_pk) ?? [];
  }, [selected?.id_sensor_pk, tick, hist.dataUpdatedAt]);

  // Valores actuales del panel
  const percent = toPercent(selected?.ultimo_valor, selected?.valor_minimo_sensor, selected?.valor_maximo_sensor);
  const radialColor = pickColor(selected?.ultimo_valor, selected?.valor_minimo_sensor, selected?.valor_maximo_sensor);

  // CRUD modales
  const [form, setForm] = useState<{ open: boolean; editing: Sensor | null }>({ open: false, editing: null });
  const { mutateAsync: createSensor, isPending: creating } = useCreateSensor();
  const { mutateAsync: updateSensor, isPending: updating } = useUpdateSensor();
  const { mutateAsync: removeSensor } = useRemoveSensor();
  const { mutateAsync: restoreSensor } = useRestoreSensor();

  const handleSubmitSensor = async (payload: any) => {
    if (form.editing) await updateSensor({ id: form.editing.id_sensor_pk, input: payload });
    else await createSensor(payload);
    setForm({ open: false, editing: null });
  };

  // Quick create TipoSensor
  const [tipoForm, setTipoForm] = useState<{ open: boolean }>({ open: false });
  const { mutateAsync: createTipo, isPending: creatingTipo } = useCreateTipoSensor();
  const { refetch: refetchTipos } = useTiposSensor();
  const handleQuickCreateTipo = async (payload: any) => {
    await createTipo(payload);
    await refetchTipos();
    setTipoForm({ open: false });
  };

  const handleRangeLeftEdge = useMemo(
    () =>
      throttle(() => {
        if (hist.hasNextPage && !hist.isFetchingNextPage) hist.fetchNextPage();
      }, 800),
    [hist.hasNextPage, hist.isFetchingNextPage, hist.fetchNextPage]
  );

  // Montar panel solo cuando el contenedor tiene tamaño
  const panelHostRef = useRef<HTMLDivElement | null>(null);
  const [hostReady, setHostReady] = useState(false);
  useEffect(() => {
    const el = panelHostRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      setHostReady((r?.width ?? 0) > 0 && (r?.height ?? 0) > 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Card shadow="sm" className="border border-default-100 bg-content1/60 backdrop-blur">
        {/* Header (sin buscador arriba) */}
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-semibold">Sensores · Monitoreo en tiempo real</h2>
              <p className="text-small text-default-500">Aquí verás el monitoreo de tus cultivos en vivo.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex items-center gap-2">
              <Switch isSelected={soloActivos} onValueChange={setSoloActivos}>Solo activos</Switch>
              <Switch isSelected={autoRotate} onValueChange={setAutoRotate}>Rotación</Switch>
              <Button
                size="sm"
                variant="flat"
                startContent={<RefreshCcw className="w-4 h-4" />}
                onPress={() => refetch()} // ⬅️ usa React Query
                isDisabled={loadingList}
              >
                Recargar
              </Button>
              <Button
                size="sm"
                variant="flat"
                startContent={<Layers className="w-4 h-4" />}
                onPress={() => navigate("/TipoSensorPage")}
              >
                Ver tipos
              </Button>
            </div>
          </div>
        </CardHeader>

        <Divider />

        {/* Panel tiempo real */}
        <CardBody className="space-y-4" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
          <div className="min-w-0 min-h-0">
            <div ref={panelHostRef} className="w-full h-full">
              {hostReady ? (
                <SensorRealtimePanel
                  selected={selected}
                  percent={percent}
                  radialColor={radialColor}
                  selectedHistory={selectedHistory}
                  onRangeLeftEdge={handleRangeLeftEdge}
                  onPrev={() => {
                    if (!selected || !filtered?.length) return;
                    const idx = filtered.findIndex((x) => x.id_sensor_pk === selected.id_sensor_pk);
                    const prevIdx = (idx - 1 + filtered.length) % filtered.length;
                    setSelectedId(filtered[prevIdx].id_sensor_pk);
                  }}
                  onNext={() => {
                    if (!selected || !filtered?.length) return;
                    const idx = filtered.findIndex((x) => x.id_sensor_pk === selected.id_sensor_pk);
                    const nextIdx = (idx + 1) % filtered.length;
                    setSelectedId(filtered[nextIdx].id_sensor_pk);
                  }}
                />
              ) : (
                <div className="h-[360px] w-full animate-pulse bg-default-100 rounded-xl" />
              )}
            </div>
          </div>
        </CardBody>

        <Divider />

        {/* Barra de la tabla: botón + buscador (abajo) */}
        <CardBody className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button color="primary" size="sm" onPress={() => setForm({ open: true, editing: null })}>
                + Nuevo sensor
              </Button>
            </div>
            <Input
              size="sm"
              variant="bordered"
              startContent={<Search className="w-4 h-4" />}
              placeholder="Buscar por nombre, tipo, lote, tópico, broker…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full md:w-96"
            />
          </div>
        </CardBody>

        {/* Tabla */}
        <CardBody>
          <SensoresTable
            data={filtered}
            loading={loadingList}
            onCreate={() => setForm({ open: true, editing: null })}
            onEdit={(row) => setForm({ open: true, editing: row })}
            onRemove={async (row) => {
              await removeSensor(row.id_sensor_pk);
              if (selectedId === row.id_sensor_pk) setSelectedId(null);
            }}
            onRestore={async (row) => {
              await restoreSensor(row.id_sensor_pk);
            }}
            onSelect={(id) => setSelectedId(id)}
            selectedId={selectedId}
          />
        </CardBody>
      </Card>

      {/* Modal Sensor */}
      <SensorForm
        open={form.open}
        onClose={() => setForm({ open: false, editing: null })}
        onSubmit={handleSubmitSensor}
        initial={form.editing || undefined}
        submitting={creating || updating}
        onViewTipos={() => navigate("/TipoSensorPage")}
        onQuickCreateTipo={() => setTipoForm({ open: true })}
      />

      {/* Modal TipoSensor */}
      <TipoSensorForm
        open={tipoForm.open}
        onClose={() => setTipoForm({ open: false })}
        onSubmit={handleQuickCreateTipo}
        submitting={creatingTipo}
      />
    </div>
  );
}
