import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface SensorTrendChartProps {
  sensorName: string;
  data: { fecha: Date | string; valor: number }[];
  unit: string;
  color?: string;
  width?: number;
  height?: number;
  showArea?: boolean;
}

export const SensorTrendChart: React.FC<SensorTrendChartProps> = ({
  sensorName,
  data,
  unit,
  color = '#3b82f6',
  width,
  height = 300,
  showArea = true,
}) => {
  // Format data for Recharts
  const formattedData = data.map((d) => ({
    fecha: new Date(d.fecha).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    valor: typeof d.valor === 'number' ? d.valor : parseFloat(d.valor as any),
    fechaCompleta: new Date(d.fecha).toLocaleString('es-ES'),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">{payload[0].payload.fechaCompleta}</p>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-bold text-gray-900">
              {payload[0].value.toFixed(2)} {unit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height: height, width: width || '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        {showArea ? (
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id={`gradient-${sensorName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
            <XAxis
              dataKey="fecha"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fill: '#6b7280', fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              width={60}
              label={{
                value: unit,
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: 11 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
              formatter={() => sensorName}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke={color}
              fill={`url(#gradient-${sensorName})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </AreaChart>
        ) : (
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
            <XAxis
              dataKey="fecha"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fill: '#6b7280', fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              width={60}
              label={{
                value: unit,
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: 11 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
              formatter={() => sensorName}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
