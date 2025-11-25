import { useMemo, useState, useRef, useEffect } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Tooltip } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

type Point = { ts: number; v: number };

type Tipo = {
  nombre_tipo_sensor?: string | null;
  unidades_tipo_sensor?: string | null;   // "%", "°C", "pH", "lx", etc.
  decimales_tipo_sensor?: string | null;  // "0", "0.0", "0.00", ...
};

type SensorLike = {
  id_sensor_pk: number;
  nombre_sensor: string;
  tipo_sensor?: Tipo | null;
  valor_minimo_sensor?: number | null;
  valor_maximo_sensor?: number | null;
  ultimo_valor?: number | null;
  ultima_medicion?: string | null;
};

export default function SensorRealtimePanel({
  selected,
  percent,
  radialColor = "default",
  selectedHistory,
  onPrev,
  onNext,
  onRangeLeftEdge,
}: {
  selected: SensorLike | null;
  percent: number; // 0-100 (según rango min/max del sensor)
  radialColor?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  selectedHistory: Point[];
  onPrev?: () => void;
  onNext?: () => void;
  onRangeLeftEdge?: () => void;
}) {
  // === unidad y decimales del tipo ===
  const unidad = selected?.tipo_sensor?.unidades_tipo_sensor ?? "";
  const decPattern = selected?.tipo_sensor?.decimales_tipo_sensor ?? "0";
  const decCount = useMemo(() => {
    const i = decPattern.indexOf(".");
    return i === -1 ? 0 : Math.max(0, decPattern.length - i - 1);
  }, [decPattern]);

  const fmt = (v: number | null | undefined) =>
    v == null || Number.isNaN(v) ? "—" : v.toFixed(decCount);

  const last = selected?.ultimo_valor ?? null;
  const title = selected?.nombre_sensor || "—";
  const subtitle =
    (selected?.tipo_sensor?.nombre_tipo_sensor || "—") +
    (unidad ? ` (${unidad})` : "");

  // === dataset: usar timestamp numérico y ORDEN ASCENDENTE ===
  const data = useMemo(
    () =>
      (selectedHistory || [])
        .map((p) => ({ x: +new Date(p.ts), y: p.v })) // <- número
        .sort((a, b) => a.x - b.x),
    [selectedHistory]
  );
  // punto placeholder si no hay histórico
  const dataForChart = data.length ? data : [{ x: Date.now(), y: last ?? 0 }];

  // === dominio Y ===
  const yDomain = useMemo<[number, number] | undefined>(() => {
    const lo = selected?.valor_minimo_sensor;
    const hi = selected?.valor_maximo_sensor;
    if (typeof lo === "number" && typeof hi === "number" && lo < hi) return [lo, hi];
    if (dataForChart.length) {
      const vals = dataForChart.map((p) => p.y);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const pad = (max - min || 1) * 0.1;
      return [min - pad, max + pad];
    }
    return undefined;
  }, [selected?.valor_minimo_sensor, selected?.valor_maximo_sensor, dataForChart]);

  const showBand =
    typeof selected?.valor_minimo_sensor === "number" &&
    typeof selected?.valor_maximo_sensor === "number" &&
    selected.valor_minimo_sensor < selected.valor_maximo_sensor;

  // color de acento para currentColor
  const colorClass =
    radialColor === "success"
      ? "text-success"
      : radialColor === "warning"
      ? "text-warning"
      : radialColor === "danger"
      ? "text-danger"
      : radialColor === "primary"
      ? "text-primary"
      : radialColor === "secondary"
      ? "text-secondary"
      : "text-foreground";

  // ===== Línea vertical persistente =====
  const [hoverX, setHoverX] = useState<number | null>(null);

  // ===== Medimos el contenedor (evita width/height -1) =====
  const [boxReady, setBoxReady] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      setBoxReady((r?.width ?? 0) > 0 && (r?.height ?? 0) > 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* IZQUIERDA: radial + meta info */}
      <Card shadow="sm" className="border border-default-100">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-small text-default-500">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Tooltip content="Anterior">
              <Button isIconOnly variant="flat" size="sm" onPress={onPrev} isDisabled={!onPrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Siguiente">
              <Button isIconOnly variant="flat" size="sm" onPress={onNext} isDisabled={!onNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </CardHeader>

        <CardBody className="flex items-center justify-center py-10">
          {/* Radial con conic-gradient */}
          <div className="relative w-56 h-56">
            <div
              className={`absolute inset-0 rounded-full ${colorClass}`}
              style={{
                background: `conic-gradient(currentColor ${Math.max(0, Math.min(100, percent))}%, rgba(127,127,127,.18) 0)`,
              }}
            />
            <div className="absolute inset-2 rounded-full bg-content1 shadow-inner" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className={`${colorClass} text-4xl font-semibold leading-none`}>
                  {unidad === "%" ? Math.round(percent) : fmt(last)}
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-small font-medium bg-default-100 text-default-700">
                  {unidad || "—"}
                </span>
              </div>
            </div>
          </div>
          {unidad !== "%" && (
            <div className="absolute bottom-6 text-tiny text-default-500">
              {Math.round(percent)}% del rango
            </div>
          )}
        </CardBody>
      </Card>

      {/* DERECHA: gráfica */}
      <Card shadow="sm" className="border border-default-100 min-w-0">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">
              {selected?.tipo_sensor?.nombre_tipo_sensor || "Serie temporal"}
            </h3>
            <p className="text-small text-default-500">
              Último: <span className="font-medium">{fmt(last)} {unidad || ""}</span>
              {selected?.ultima_medicion ? (
                <span className="text-default-400"> · {new Date(selected.ultima_medicion).toLocaleString()}</span>
              ) : null}
            </p>
          </div>
          <Chip size="sm" variant="flat">{unidad || "—"}</Chip>
        </CardHeader>

        <CardBody className={`h-[300px] md:h-[320px] ${colorClass} min-w-0 min-h-0`}>
          <div ref={boxRef} className="w-full h-full min-w-0 min-h-0">
            {boxReady ? (
              <ResponsiveContainer width="100%" height="100%" debounce={80}>
                <AreaChart
                  data={dataForChart}
                  onMouseMove={(state: any) => {
                    const x = state?.activePayload?.[0]?.payload?.x; // timestamp numérico
                    if (Number.isFinite(x)) setHoverX(x as number);
                    // si no hay payload, NO tocar hoverX para que la línea no parpadee
                  }}
                  onMouseLeave={() => setHoverX(null)}
                >
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>

                  {showBand && yDomain && (
                    <ReferenceArea
                      y1={selected!.valor_minimo_sensor!}
                      y2={selected!.valor_maximo_sensor!}
                      strokeOpacity={0}
                      fill="currentColor"
                      fillOpacity={0.08}
                    />
                  )}

                  {/* Línea vertical persistente bajo el cursor */}
                  {hoverX != null && (
                    <ReferenceLine
                      x={hoverX}
                     
                      stroke="currentColor"
                      strokeOpacity={0.75}
                      strokeWidth={1}
                    />
                  )}

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,140,160,.25)" vertical={false} />

                  <XAxis
                    dataKey="x"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(t: number) =>
                      new Date(t).toLocaleTimeString([], { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })
                    }
                    minTickGap={18}
                    tick={{ fontSize: 11, fill: "var(--heroui-foreground-500)" }}
                    axisLine={{ stroke: "rgba(140,140,160,.35)" }}
                  />
                  <YAxis
                    domain={yDomain || ["dataMin", "dataMax"]}
                    width={44}
                    tickFormatter={(n: number) => `${Number(n).toFixed(decCount)}`}
                    tick={{ fontSize: 11, fill: "var(--heroui-foreground-500)" }}
                    axisLine={{ stroke: "rgba(140,140,160,.35)" }}
                  />

                  <RTooltip
                    cursor={false}
                    isAnimationActive={false}
                    contentStyle={{
                      background: "var(--heroui-content1)",
                      border: "1px solid var(--heroui-default-200)",
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,.10)",
                    }}
                    labelFormatter={(t: number) => new Date(t).toLocaleString([], { hour12: true })}
                    formatter={(val: any) => [`${Number(val).toFixed(decCount)} ${unidad}`, "Valor"]}
                  />

                  <Area
                    type="monotone"
                    dataKey="y"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill="url(#areaFill)"
                    dot={false}
                    isAnimationActive={false}
                  />

                  {/* Brush para navegar; si llega al borde izquierdo, pedir más historial */}
                  <Brush
                    dataKey="x"
                    height={18}
                    travellerWidth={8}
                    stroke="rgba(140,140,160,.45)"
                    tickFormatter={(t: number) =>
                      new Date(t).toLocaleTimeString([], { hour12: true, minute: "2-digit", second: "2-digit" })
                    }
                    onChange={(range) => {
                      if (typeof (range as any)?.startIndex === "number" && (range as any).startIndex === 0) {
                        onRangeLeftEdge?.();
                      }
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full animate-pulse bg-default-100 rounded-lg" />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
