import React, { useState, useEffect } from 'react';
import { Card, CardBody, ButtonGroup, Button } from "@heroui/react";
import { LineChart, BarChart3, AreaChart as AreaChartIcon } from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { connectSocket, api } from '../../../shared/api/client';
import { IoTApi } from '../api/iot.api';
import type { Sensor, SensorLectura } from '../model/iot.types';

interface SensorAnalyticsProps {
  sensor: Sensor;
}

type ChartType = 'line' | 'area' | 'bar';

interface Metrics {
  avg: number;
  min: number;
  max: number;
  minDate: string;
  maxDate: string;
}

const COLORS = {
  stroke: '#3b82f6',
  fill: 'url(#colorBlue)',
  gradient: { start: '#3b82f6', end: '#3b82f6' }
};

// Time window for data retention (2 minutes)
const TWO_MINUTES_MS = 2 * 60 * 1000;

// Helper function to filter readings by time window
const filterRecentReadings = (readings: SensorLectura[]): SensorLectura[] => {
  const now = Date.now();
  return readings.filter(r => {
    const readingTime = new Date(r.fechaLectura).getTime();
    return (now - readingTime) <= TWO_MINUTES_MS;
  });
};

export const SensorAnalytics: React.FC<SensorAnalyticsProps> = ({ sensor }) => {
  const [readings, setReadings] = useState<SensorLectura[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  // Check if electrovalve
  const isElectrovalve = sensor.nombre.toLowerCase().includes('electroválvula') ||
    sensor.nombre.toLowerCase().includes('electrovalvula') ||
    sensor.nombre.toLowerCase().includes('bomba') ||
    sensor.nombre.toLowerCase().includes('válvula') ||
    sensor.nombre.toLowerCase().includes('valvula');

  // Fetch initial readings and summary
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch readings (last 40)
        const readingsData = await IoTApi.getSensorReadings(sensor.id, { limit: 40 });
        const reversedData = readingsData.reverse();
        // Apply time-based filtering
        setReadings(filterRecentReadings(reversedData));

        // Fetch summary metrics if sensor has tipoSensorId
        if (sensor.tipoSensorId) {
          const summaryData = await api.get('/reports/iot/summary', {
            params: {
              tipoSensorId: sensor.tipoSensorId,
              from: '2020-01-01',
              to: '2030-12-31'
            }
          });

          // Update metrics from summary
          if (summaryData.data) {
            setMetrics({
              avg: summaryData.data.promedio,
              min: summaryData.data.lecturaMinima.valor,
              max: summaryData.data.lecturaMaxima.valor,
              minDate: summaryData.data.lecturaMinima.fecha,
              maxDate: summaryData.data.lecturaMaxima.fecha
            });
          }
        }
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // WebSocket for real-time updates
    const socket = connectSocket('/iot');

    const handleNuevaLectura = (lectura: any) => {
      if (lectura.sensorId === sensor.id) {
        setReadings(prev => {
          // Transform WebSocket data to match frontend format
          const transformedLectura = {
            ...lectura,
            fechaLectura: lectura.fecha || lectura.fechaLectura, // Map fecha to fechaLectura
            valor: typeof lectura.valor === 'string' ? parseFloat(lectura.valor) : lectura.valor
          };

          // Add new reading and filter by time window
          const updated = filterRecentReadings([...prev, transformedLectura]);
          return updated;
        });
      }
    };

    socket.on('nuevaLectura', handleNuevaLectura);

    // Cleanup interval: Remove stale data every 30 seconds
    const cleanupInterval = setInterval(() => {
      setReadings(prev => filterRecentReadings(prev));
    }, 30000); // 30 seconds

    return () => {
      socket.off('nuevaLectura', handleNuevaLectura);
      clearInterval(cleanupInterval);
    };
  }, [sensor.id, sensor.tipoSensorId]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Cargando analítica...</p>
        </div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-gray-400">No hay datos disponibles para este sensor</p>
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (isElectrovalve) return value === 1 ? 'Encendido' : 'Apagado';
    return value;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChart = () => {
    const ChartComponent = chartType === 'line' ? RechartsLineChart : chartType === 'area' ? AreaChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : chartType === 'area' ? Area : Bar;

    return (
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={readings} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <defs>
            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="fechaLectura"
            angle={-45}
            textAnchor="end"
            height={90}
            interval="preserveStartEnd"
            tick={{ fill: '#6b7280', fontSize: 9 }}
            tickFormatter={(value) => {
              if (!value) return '';
              try {
                const date = new Date(value);
                if (isNaN(date.getTime())) return '';
                // Show date and time for better context
                return date.toLocaleString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } catch {
                return '';
              }
            }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={70}
            domain={isElectrovalve ? [0, 1] : undefined}
            ticks={isElectrovalve ? [0, 1] : undefined}
            tickFormatter={(value) => isElectrovalve ? (value === 1 ? 'Encendido' : 'Apagado') : value}
          />
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">{formatDate(label)}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-bold text-gray-900">
                        {formatValue(payload[0].value)}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          {chartType !== 'bar' && <Legend />}
          <DataComponent
            dataKey="valor"
            name={sensor.tipoSensor?.nombre || 'Valor'}
            stroke={COLORS.stroke}
            fill={chartType === 'area' ? COLORS.fill : chartType === 'bar' ? '#3b82f6' : undefined}
            strokeWidth={3}
            dot={chartType !== 'bar' ? { r: 3, fill: '#3b82f6' } : undefined}
            activeDot={chartType !== 'bar' ? { r: 5 } : undefined}
            radius={chartType === 'bar' ? ([8, 8, 0, 0] as [number, number, number, number]) : undefined}
            animationDuration={800}
            connectNulls
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-4">
              <p className="text-sm text-gray-500 mb-1">Promedio</p>
              <p className="text-3xl font-bold text-blue-600">{formatValue(metrics.avg)}</p>
            </CardBody>
          </Card>

          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-4">
              <p className="text-sm text-gray-500 mb-1">Mínimo</p>
              <p className="text-3xl font-bold text-green-600">{formatValue(metrics.min)}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(metrics.minDate!)}</p>
            </CardBody>
          </Card>

          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-4">
              <p className="text-sm text-gray-500 mb-1">Máximo</p>
              <p className="text-3xl font-bold text-red-600">{formatValue(metrics.max)}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(metrics.maxDate!)}</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card className="shadow-sm rounded-xl border border-gray-200 bg-white">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Gráfica del Sensor</h3>
            </div>

            <ButtonGroup size="sm" variant="flat" className="shadow-sm">
              <Button
                onClick={() => setChartType('line')}
                className={`transition-all duration-200 ${chartType === 'line'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <LineChart className="w-4 h-4 mr-1" />
                Línea
              </Button>
              <Button
                onClick={() => setChartType('area')}
                className={`transition-all duration-200 ${chartType === 'area'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <AreaChartIcon className="w-4 h-4 mr-1" />
                Área
              </Button>
              <Button
                onClick={() => setChartType('bar')}
                className={`transition-all duration-200 ${chartType === 'bar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Barras
              </Button>
            </ButtonGroup>
          </div>

          {renderChart()}
        </CardBody>
      </Card>
    </div>
  );
};
