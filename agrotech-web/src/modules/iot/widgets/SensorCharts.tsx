import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardBody, ButtonGroup, Button, CircularProgress, Spinner } from '@heroui/react';
import { BarChart3 as BarChartIcon, AreaChart as AreaChartIcon, LineChart as LineIcon, Activity } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useIoTRealTimeSensors } from '../hooks/useIoTRealTimeSensors';
import type { Sensor } from '../model/iot.types';

interface SensorChartsProps {
  timeSeriesData: any[];
  sensorSummaryData: any[];
  loading: boolean;
  isLive?: boolean;
  sensors?: Sensor[];
  layout?: 'carousel' | 'grid';
}

type ChartType = 'line' | 'area' | 'bar' | 'radial';

const COLORS = [
  { stroke: '#3b82f6', fill: 'url(#colorBlue)' },
  { stroke: '#10b981', fill: 'url(#colorGreen)' },
  { stroke: '#f59e0b', fill: 'url(#colorOrange)' },
  { stroke: '#8b5cf6', fill: 'url(#colorPurple)' },
  { stroke: '#ef4444', fill: 'url(#colorRed)' },
  { stroke: '#06b6d4', fill: 'url(#colorCyan)' },
  { stroke: '#ec4899', fill: 'url(#colorPink)' },
  { stroke: '#f97316', fill: 'url(#colorDeepOrange)' },
];

export const SensorCharts: React.FC<SensorChartsProps> = ({ timeSeriesData, loading, isLive, sensors = [] }) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasSeries = timeSeriesData.length > 0;
  const activeIndex = hasSeries ? currentIndex % timeSeriesData.length : 0;
  const activeSeriesList = hasSeries ? [timeSeriesData[activeIndex]] : [];

  const { getFormattedSensorData } = useIoTRealTimeSensors(sensors);

  const cards = useMemo(() => {
    if (isLive) return timeSeriesData;
    if (chartType === 'bar') return timeSeriesData; // treated separately but keeps length info
    return timeSeriesData;
  }, [isLive, timeSeriesData, chartType]);

  useEffect(() => {
    setCurrentIndex(0);
    if (containerRef.current) containerRef.current.scrollTo({ left: 0 });
  }, [cards.length]);

  useEffect(() => {
    if (cards.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 20000);
    return () => clearInterval(id);
  }, [cards.length]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Spinner color="success" label="Cargando gráficos..." />
      </div>
    );
  }



  const renderGradients = () => (
    <defs>
      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="colorDeepOrange" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
      </linearGradient>
    </defs>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            {new Date(label).toLocaleString('es-ES', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-bold text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // ... render functions ...
  const renderIndividualChart = (series: any, idx: number, sensor?: Sensor) => {
    const colorIndex = idx % COLORS.length;

    if (chartType === 'bar') {
      const isPump = sensor && (sensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') || sensor.nombre?.toLowerCase().includes('bomba'));
      const isDisconnected = sensor?.estadoConexion === 'DESCONECTADO';

      if (isPump) {
        const lastValue = series.data && series.data.length > 0 ? series.data[series.data.length - 1].valor : null;
        const displayValue = lastValue !== null ? (Number(lastValue) === 1 ? 'Prendido' : 'Apagado') : 'Sin datos';
        return (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-full min-h-[420px] flex flex-col items-center justify-center">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{series.name}</h4>
            <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
          </div>
        );
      }

      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-full min-h-[420px]">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{series.name} {isDisconnected ? '(Desconectado)' : ''}</h4>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series.data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                {renderGradients()}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="fechaLectura"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickFormatter={(value) => {
                    if (!value) return '';
                    const date = new Date(value);
                    return date.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="valor"
                  fill={COLORS[colorIndex].fill}
                  stroke={COLORS[colorIndex].stroke}
                  strokeWidth={1}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
    const DataComponent = chartType === 'area' ? Area : Line;

    const isPump = sensor && (sensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') || sensor.nombre?.toLowerCase().includes('bomba'));
    const isDisconnected = sensor?.estadoConexion === 'DESCONECTADO';

    if (isPump) {
      const lastValue = series.data && series.data.length > 0 ? series.data[series.data.length - 1].valor : null;
      const displayValue = lastValue !== null ? (Number(lastValue) === 1 ? 'Prendido' : 'Apagado') : 'Sin datos';
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-full min-h-[420px] flex flex-col items-center justify-center">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{series.name}</h4>
          <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-full min-h-[420px]">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{series.name} {isDisconnected ? '(Desconectado)' : ''}</h4>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={series.data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              {renderGradients()}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="fechaLectura"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickFormatter={(value) => {
                  if (!value) return '';
                  const date = new Date(value);
                  return date.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                width={60}
                domain={isPump ? [0, 1] : undefined}
                ticks={isPump ? [0, 1] : undefined}
                tickFormatter={(value) => {
                  if (isPump) {
                    return Number(value) === 1 ? 'Prendido' : 'Apagado';
                  }
                  return typeof value === 'number' ? value.toFixed(2) : value;
                }}
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value;
                    const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
                    const displayValue = isPump ? (Number(value) === 1 ? 'Prendido' : 'Apagado') : formattedValue;

                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(label).toLocaleString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].color }} />
                          <span className="text-sm font-bold text-gray-900">{displayValue}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <DataComponent
                type="monotone"
                dataKey="valor"
                stroke={COLORS[colorIndex].stroke}
                fill={chartType === 'area' ? COLORS[colorIndex].fill : undefined}
                strokeWidth={3}
                dot={{ r: 3, fill: COLORS[colorIndex].stroke }}
                activeDot={{ r: 5 }}
                animationDuration={800}
                connectNulls
              />
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    const renderGaugeCard = (series: any, idx: number, sensor?: Sensor) => {
      const isPump = sensor && (sensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') || sensor.nombre?.toLowerCase().includes('bomba'));


      if (isPump) {
        const lastValue = series.data && series.data.length > 0 ? series.data[series.data.length - 1].valor : null;
        const displayValue = lastValue !== null ? (Number(lastValue) === 1 ? 'Prendido' : 'Apagado') : 'Sin datos';
        return (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-full min-h-[420px] flex flex-col items-center justify-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">{series.name}</h4>
            <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
          </div>
        );
      }

      const values = series.data?.map((d: any) => d.valor) || [];
      const lastValue = values.length ? values[values.length - 1] : 0;
      const maxValue = Math.max(...values, 1);


      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-full min-h-[420px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-700">{series.name}</h4>
            <span className="text-sm text-gray-500">Actual</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <CircularProgress
              classNames={{
                svg: "w-48 h-48 drop-shadow-md",
                indicator: "stroke-current",
                track: "stroke-gray-100",
                value: "text-3xl font-bold font-mono text-gray-800",
              }}
              value={lastValue}
              maxValue={maxValue}
              size="lg"
              showValueLabel={true}
              color={
                idx % COLORS.length === 0 ? "primary" :
                  idx % COLORS.length === 1 ? "success" :
                    idx % COLORS.length === 2 ? "warning" :
                      idx % COLORS.length === 4 ? "danger" :
                        "secondary"
              }
              formatOptions={{ style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
            <p className="text-sm text-gray-500 mt-4 font-medium">Referencia Max: {maxValue}</p>
          </div>
        </div>
      );
    };

    if (timeSeriesData.length === 1) {
      const sensor = sensors.find(s => s.id === timeSeriesData[0].sensorId);
      return renderGaugeCard(timeSeriesData[0], 0, sensor);
    }

    return (
      <div className="relative">
        {activeSeriesList.map((series) => {
          const sensor = sensors.find(s => s.id === series.sensorId);
          return (
            <div key={series.sensorId} className="w-full">
              <div className="h-full min-h-[320px]">{renderGaugeCard(series, activeIndex, sensor)}</div>
            </div>
          );
        })}
        {timeSeriesData.length > 1 && (
          <div className="flex justify-between items-center mt-1">
            <Button size="sm" variant="flat" onPress={goPrev}>
              Prev
            </Button>
            <div className="flex gap-1">
              {timeSeriesData.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2 w-2 rounded-full ${idx === currentIndex ? 'bg-emerald-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <Button size="sm" variant="flat" onPress={goNext}>
              Next
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            {isLive ? 'Monitoreo en tiempo real' : 'Graficas de Sensores'}
          </h3>
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 shadow-sm">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-sm"></span>
              </div>
              <span className="text-xs font-semibold text-green-700">En vivo</span>
            </div>
          )}
        </div>

        <ButtonGroup size="sm" variant="flat" className="shadow-sm">
          <Button
            onClick={() => setChartType('line')}
            className={`transition-all duration-200 ${chartType === 'line' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <LineIcon className="w-4 h-4 mr-1" />
            Líneas
          </Button>
          <Button
            onClick={() => setChartType('area')}
            className={`transition-all duration-200 ${chartType === 'area' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <AreaChartIcon className="w-4 h-4 mr-1" />
            Área
          </Button>
          <Button
            onClick={() => setChartType('bar')}
            className={`transition-all duration-200 ${chartType === 'bar' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <BarChartIcon className="w-4 h-4 mr-1" />
            Barras
          </Button>
          <Button
            onClick={() => setChartType('radial')}
            className={`transition-all duration-200 ${chartType === 'radial' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Activity className="w-4 h-4 mr-1" />
            Radial
          </Button>
        </ButtonGroup>
      </div>
      {isLive ? (
        <div className="relative">
          <div
            ref={containerRef}
            className="w-full"
          >
            {activeSeriesList.map((series) => {
              const lastReading = series.data && series.data.length > 0 ? series.data[series.data.length - 1] : null;
              const color = COLORS[activeIndex % COLORS.length].stroke;
              const sensor = sensors.find(s => s.id === series.sensorId || s.nombre === series.name);
              const realTimeData = sensor ? getFormattedSensorData(sensor.id) : null;
              const isPump = sensor && (sensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') ||
                sensor.nombre?.toLowerCase().includes('bomba'));
              const currentValue = realTimeData ? realTimeData.value : (lastReading ? lastReading.valor : null);

              const formattedCurrentValue = typeof currentValue === 'number' ? currentValue.toFixed(2) : currentValue;
              const displayValue = (isPump && currentValue !== null ? (Number(currentValue) === 1 ? 'Prendido' : 'Apagado') : formattedCurrentValue);


              return (
                <div
                  key={series.sensorId}
                  className="flex-shrink-0 snap-start w-full min-w-full"
                >
                  <Card className="bg-white border border-gray-200 shadow-sm h-full">
                    <CardBody className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Sensor</p>
                          <p className="text-lg font-bold text-gray-900">{series.name}</p>

                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Valor actual</p>
                          <p className="text-3xl font-bold" style={isPump ? {} : { color }}>
                            {displayValue !== null ? displayValue : '-'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {realTimeData
                              ? realTimeData.timeAgo
                              : (lastReading
                                ? new Date(lastReading.fechaLectura).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                : 'Sin lectura')}
                          </p>
                        </div>
                      </div>
                      <div className="h-[240px] w-full">
                        {chartType === 'radial' ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <CircularProgress
                              classNames={{
                                svg: "w-44 h-44 drop-shadow-md",
                                indicator: "stroke-current",
                                track: "stroke-gray-100",
                                value: "text-2xl font-bold font-mono",
                              }}
                              value={typeof currentValue === 'number' ? currentValue : 0}
                              maxValue={100}
                              size="lg"
                              showValueLabel={true}
                              strokeWidth={4}
                              color={
                                activeIndex % COLORS.length === 0 ? "primary" :
                                  activeIndex % COLORS.length === 1 ? "success" :
                                    activeIndex % COLORS.length === 2 ? "warning" :
                                      activeIndex % COLORS.length === 4 ? "danger" :
                                        "secondary"
                              }
                              formatOptions={{ style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                            />
                            <p className="text-sm text-gray-600 mt-3 font-semibold text-center">{series.name}</p>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' ? (
                              <LineChart data={series.data.slice(-150)} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                                <defs>
                                  <linearGradient id={`gradient-${sensor?.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6} />
                                <XAxis
                                  dataKey="fechaLectura"
                                  angle={-30}
                                  textAnchor="end"
                                  height={40}
                                  tick={{ fill: '#6b7280', fontSize: 10 }}
                                  tickFormatter={(value) => {
                                    if (!value) return '';
                                    const date = new Date(value);
                                    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                  }}
                                />
                                <YAxis
                                  domain={['dataMin - 2', 'dataMax + 2']}
                                  tick={{ fill: '#6b7280', fontSize: 11 }}
                                  width={50}
                                />
                                <Tooltip
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : value, 'Valor']}
                                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="valor"
                                  stroke={color}
                                  strokeWidth={3}
                                  dot={false}
                                  activeDot={{ r: 4, strokeWidth: 0 }}
                                  animationDuration={500}
                                  isAnimationActive={false}
                                  connectNulls
                                />
                              </LineChart>
                            ) : chartType === 'bar' ? (
                              <BarChart data={series.data.slice(-150)} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6} />
                                <XAxis
                                  dataKey="fechaLectura"
                                  angle={-30}
                                  textAnchor="end"
                                  height={40}
                                  tick={{ fill: '#6b7280', fontSize: 10 }}
                                  tickFormatter={(value) => {
                                    if (!value) return '';
                                    const date = new Date(value);
                                    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                  }}
                                />
                                <YAxis
                                  domain={['dataMin - 2', 'dataMax + 2']}
                                  tick={{ fill: '#6b7280', fontSize: 11 }}
                                  width={50}
                                />
                                <Tooltip
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : value, 'Valor']}
                                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                                />
                                <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} animationDuration={500} isAnimationActive={false} />
                              </BarChart>
                            ) : ( // Default to AreaChart
                              <AreaChart data={series.data.slice(-150)} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                                <defs>
                                  <linearGradient id={`gradient-${sensor?.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.6} />
                                <XAxis
                                  dataKey="fechaLectura"
                                  angle={-30}
                                  textAnchor="end"
                                  height={40}
                                  tick={{ fill: '#6b7280', fontSize: 10 }}
                                  tickFormatter={(value) => {
                                    if (!value) return '';
                                    const date = new Date(value);
                                    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                  }}
                                />
                                <YAxis
                                  domain={['dataMin - 2', 'dataMax + 2']}
                                  tick={{ fill: '#6b7280', fontSize: 11 }}
                                  width={50}
                                />
                                <Tooltip
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : value, 'Valor']}
                                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="valor"
                                  stroke={color}
                                  fill={`url(#gradient-${sensor?.id})`}
                                  strokeWidth={3}
                                  dot={false}
                                  animationDuration={500}
                                  isAnimationActive={false}
                                  connectNulls
                                />
                              </AreaChart>
                            )}
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              );
            })}
          </div>
          {timeSeriesData.length > 1 && (
            <div className="flex justify-between items-center mt-1">
              <Button size="sm" variant="flat" onPress={goPrev}>
                Prev
              </Button>
              <div className="flex gap-1">
                {timeSeriesData.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full ${idx === currentIndex ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
              <Button size="sm" variant="flat" onPress={goNext}>
                Next
              </Button>
            </div>
          )}
        </div>
      ) : chartType === 'radial' ? (
        renderBarChart()
      ) : (!isLive && timeSeriesData.length === 1) ? (
        <div className="relative">
          <div className="w-full min-h-[420px]">{renderIndividualChart(timeSeriesData[0], 0, sensors.find(s => s.id === timeSeriesData[0].sensorId))}</div>
        </div>
      ) : (
        <div className="relative">
          {activeSeriesList.map((series) => {
            const sensor = sensors.find(s => s.id === series.sensorId);
            return (
              <div key={series.sensorId} className="w-full">
                <div className="h-full min-h-[420px]">{renderIndividualChart(series, activeIndex, sensor)}</div>
              </div>
            );
          })}
          {timeSeriesData.length > 1 && (
            <div className="flex justify-between items-center mt-1">
              <Button size="sm" variant="flat" onPress={goPrev}>
                Prev
              </Button>
              <div className="flex gap-1">
                {timeSeriesData.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full ${idx === currentIndex ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
              <Button size="sm" variant="flat" onPress={goNext}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
