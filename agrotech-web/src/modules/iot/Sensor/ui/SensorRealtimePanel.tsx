// src/modules/iot/sensores/features/SensorRealtimePanel.tsx
import { useMemo, useRef, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Chip, Button, Tooltip } from "@heroui/react";
import {
  Area, AreaChart, Brush, CartesianGrid, ResponsiveContainer,
  Tooltip as RTooltip, XAxis, YAxis, ReferenceArea, ReferenceLine,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** === Tipos === */
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
  /** === Unidad/decimales === */
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

  /** === Dataset: timestamp numérico ascendente + 3 puntos de respaldo === */
  const dataForChart = useMemo(() => {
    let base = (selectedHistory || [])
      .map((p) => ({ x: +new Date(p.ts), y: p.v }))
      .filter((p) => Number.isFinite(p.x))
      .sort((a, b) => a.x - b.x);

    if (base.length === 0) {
      // 3 puntos para que exista algo visible y ejes estables
      const now = Date.now();
      const y = Number.isFinite(last as number) ? (last as number) : 0;
      base = [
        { x: now - 2000, y },
        { x: now - 1000, y },
        { x: now, y },
      ];
    } else if (base.length === 1) {
      // duplica para que haya línea/brush
      const only = base[0];
      base = [
        { x: only.x - 1000, y: only.y },
        only,
        { x: only.x + 1000, y: only.y },
      ];
    } else if (base.length === 2) {
      // agrega un tercero interpolado
      const midX = Math.round((base[0].x + base[1].x) / 2);
      const midY = (base[0].y + base[1].y) / 2;
      base = [base[0], { x: midX, y: midY }, base[1]];
    }
    return base;
  }, [selectedHistory, last]);

  /** === Dominio Y (usar min/max si vienen, si no, dinámico) === */
  const yDomain = useMemo<[number, number] | undefined>(() => {
    const lo = selected?.valor_minimo_sensor;
    const hi = selected?.valor_maximo_sensor;
    if (typeof lo === "number" && typeof hi === "number" && lo < hi) return [lo, hi];
    const vals = dataForChart.map((p) => p.y);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min || 1) * 0.1;
    return [min - pad, max + pad];
  }, [selected?.valor_minimo_sensor, selected?.valor_maximo_sensor, dataForChart]);

  /** === Sombreado entre min/max si son válidos === */
  const showBand =
    typeof selected?.valor_minimo_sensor === "number" &&
    typeof selected?.valor_maximo_sensor === "number" &&
    selected.valor_minimo_sensor < selected.valor_maximo_sensor;

  /** === Clase de color para usar currentColor === */
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

  /** === Líneas verticales persistentes/último === */
  const [hoverX, setHoverX] = useState<number | null>(null);
  const lastX = dataForChart[dataForChart.length - 1]?.x;

  /** === Anti width(-1)/height(-1): medir contenedor y montar sólo cuando hay tamaño === */
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [boxReady, setBoxReady] = useState(false);
  const [boxKey, setBoxKey] = useState("0x0"); // fuerza remount en resize
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const ensure = () => {
      const rect = el.getBoundingClientRect();
      const ok = rect.width > 0 && rect.height > 0;
      setBoxReady(ok);
      setBoxKey(`${Math.round(rect.width)}x${Math.round(rect.height)}`);
    };

    // 1) primer frame (por si el padre está en display:none al mount)
    let raf = requestAnimationFrame(ensure);

    // 2) observar cambios
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(ensure);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    // 2 columnas: izquierda fija 340px, derecha flexible
    <div className="w-full grid gap-5 items-start grid-cols-2" style={{ gridTemplateColumns: "340px minmax(0,1fr)" }}>
      {/* IZQUIERDA: radial + navegación */}
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

        <CardBody className="flex flex-col items-center justify-center py-8">
          <div className="relative w-56 h-56">
            {/* Pista + progreso */}
            <div
              className={`absolute inset-0 rounded-full ${colorClass}`}
              style={{
                background: `conic-gradient(currentColor ${Math.max(0, Math.min(100, percent))}%, rgba(127,127,127,.18) 0)`,
              }}
            />
            {/* Agujero central */}
            <div className="absolute inset-4 rounded-full bg-content1 shadow-inner" />
            {/* Valor + unidad */}
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
            <div className="mt-3 text-tiny text-default-500">{Math.round(percent)}% del rango</div>
          )}
        </CardBody>
      </Card>

      {/* DERECHA: gráfica temporal */}
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

        {/* Altura fija + min-w/min-h para que ResponsiveContainer tenga base */}
        <CardBody className={`h-[320px] ${colorClass} min-w-0 min-h-0`}>
          <div ref={boxRef} className="w-full h-full min-w-0 min-h-0">
            {!boxReady ? (
              <div className="w-full h-full rounded-lg bg-default-100 animate-pulse" />
            ) : (
              <ResponsiveContainer key={boxKey} width="100%" height="100%" debounce={80}>
                <AreaChart
                  data={dataForChart}
                  onMouseMove={(s: any) => {
                    // usamos el valor EXACTO del punto más cercano para evitar jitter
                    const x = s?.activePayload?.[0]?.payload?.x;
                    if (Number.isFinite(x)) setHoverX(x as number);
                  }}
                  onMouseLeave={() => setHoverX(null)}
                >
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>

                  {/* Banda de rango */}
                  {showBand && yDomain && (
                    <ReferenceArea
                      y1={selected!.valor_minimo_sensor!}
                      y2={selected!.valor_maximo_sensor!}
                      strokeOpacity={0}
                      fill="currentColor"
                      fillOpacity={0.08}
                    />
                  )}

                  {/* Línea horizontal al último valor */}
                  {Number.isFinite(last as number) && (
                    <ReferenceLine
                      y={last as number}
                      stroke="currentColor"
                      strokeOpacity={0.55}
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Línea vertical al último punto */}
                  {Number.isFinite(lastX) && (
                    <ReferenceLine
                      x={lastX}
                      stroke="currentColor"
                      strokeOpacity={0.25}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Línea vertical persistente bajo el cursor */}
                  {Number.isFinite(hoverX as number) && (
                    <ReferenceLine
                      x={hoverX as number}
                      stroke="currentColor"
                      strokeOpacity={0.7}
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
                    cursor={false} // usamos nuestras ReferenceLines en vez del cursor por defecto
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
                    // Puntos visibles (r = 3) + activeDot
                    dot={{ r: 3, stroke: "currentColor", strokeWidth: 1, fill: "currentColor" }}
                    activeDot={{ r: 4, stroke: "currentColor", strokeWidth: 1, fill: "currentColor" }}
                    isAnimationActive={false}
                  />

                  <Brush
                    dataKey="x"
                    height={18}
                    travellerWidth={8}
                    stroke="rgba(140,140,160,.45)"
                    tickFormatter={(t: number) =>
                      new Date(t).toLocaleTimeString([], { hour12: true, minute: "2-digit", second: "2-digit" })
                    }
                    onChange={(range) => {
                      const r = range as any;
                      if (typeof r?.startIndex === "number" && r.startIndex === 0) {
                        onRangeLeftEdge?.();
                      }
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
