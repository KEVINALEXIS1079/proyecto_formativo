// src/modules/iot/Sensor/features/SensorRealtimePanel.tsx
import { CircularProgress } from "@heroui/react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from "recharts";
import type { Sensor } from "../model/types";

type HistoryPoint = { time: string; v: number };

export default function SensorRealtimePanel({
  selected, percent, radialColor, selectedHistory,
}: {
  selected: Sensor | null;
  percent: number;
  radialColor: "default" | "success" | "warning" | "danger";
  selectedHistory: HistoryPoint[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* IZQ */}
      <div className="md:col-span-4 min-w-0">  {/* <- evita width negativo */}
        <div className="bg-content2 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="text-default-500 mb-2">
            {selected?.tipo_sensor?.nombre_tipo_sensor ?? "—"}
          </div>

          {selected ? (
            <CircularProgress
              aria-label="Nivel actual"
              value={percent}
              color={radialColor}
              showValueLabel
              classNames={{ base: "relative", svg: "w-44 h-44", value: "text-3xl font-bold" }}
            >
              <div className="text-center text-default-600">
                {selected.ultimo_valor ?? "—"}
                {selected.tipo_sensor?.unidades_tipo_sensor ? ` ${selected.tipo_sensor.unidades_tipo_sensor}` : ""}
                <div className="text-tiny mt-1">
                  {selected.valor_minimo_sensor != null && selected.valor_maximo_sensor != null
                    ? `Rango: ${selected.valor_minimo_sensor} – ${selected.valor_maximo_sensor}`
                    : "Sin umbrales"}
                </div>
              </div>
            </CircularProgress>
          ) : (
            <div className="text-default-500">Selecciona un sensor</div>
          )}

          <div className="w-full flex items-center justify-between mt-4 text-default-500">
            <span>0</span><span>100</span>
          </div>
        </div>
      </div>

      {/* DER */}
      <div className="md:col-span-8 min-w-0">  {/* <- evita width negativo */}
        {/* Contenedor con altura fija y min-w-0 */}
        <div className="w-full min-w-0">
          <ResponsiveContainer width="100%" height={240}>   {/* <- altura numérica */}
            <AreaChart data={selectedHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis width={48} tick={{ fontSize: 11 }} allowDecimals />
              <RTooltip isAnimationActive={false} formatter={(v: any) => [v, "valor"]} labelFormatter={(l: string) => `Hora: ${l}`} />
              <Area type="monotone" dataKey="v" dot={false} isAnimationActive={false} strokeOpacity={0.9} fillOpacity={0.15} />
            </AreaChart>  
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
