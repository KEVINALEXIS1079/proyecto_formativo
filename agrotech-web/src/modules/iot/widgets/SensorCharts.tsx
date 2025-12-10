import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { Card, CardBody, ButtonGroup, Button } from '@heroui/react';
import { BarChart3 as BarChartIcon, AreaChart as AreaChartIcon, LineChart as LineIcon, Activity } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useIoTRealTimeSensors } from '../hooks/useIoTRealTimeSensors';
import type { Sensor } from '../model/iot.types';

interface SensorChartsProps {
  timeSeriesData: any[];
  sensorSummaryData: any[];
  loading: boolean;
  isLive?: boolean;
  sensors?: Sensor[];
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

export const SensorCharts: React.FC<SensorChartsProps> = ({ timeSeriesData, sensorSummaryData, loading, isLive, sensors = [] }) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasSeries = timeSeriesData.length > 0;
  const activeIndex = hasSeries ? currentIndex % timeSeriesData.length : 0;
  const activeSeriesList = hasSeries ? [timeSeriesData[activeIndex]] : [];

  const { getFormattedSensorData, connectionStatus } = useIoTRealTimeSensors(sensors);

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
    }, 8000);
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
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Cargando graficos...</p>
        </div>
      </div>
    );
  }

  if (timeSeriesData.length === 0 && sensorSummaryData.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-2">
          <BarChartIcon className="w-8 h-8 text-gray-400" />
          <p className="text-gray-400 text-lg">No hay datos disponibles</p>
          <p className="text-gray-300 text-sm mt-2">Seleccione un lote para ver las graficas</p>
        </div>
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

  const renderIndividualChart = (series: any, idx: number, sensor?: Sensor) => {
    const colorIndex = idx % COLORS.length;

    if (chartType === 'bar') {
      const isPump = sensor && (sensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') || sensor.nombre?.toLowerCase().includes('bomba'));
      const isDisconnected = sensor?.estado === 'DESCONECTADO';

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
    const isDisconnected = sensor?.estado === 'DESCONECTADO';

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
                  return value;
                }}
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value;
                    const displayValue = isPump ? (Number(value) === 1 ? 'Prendido' : 'Apagado') : value;

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
      const isDisconnected = sensor?.estado === 'DESCONECTADO';

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
      const gaugeData = [{ name: series.name, value: lastValue, fill: COLORS[idx % COLORS.length].stroke }];

      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-full min-h-[420px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-700">{series.name}</h4>
            <span className="text-sm text-gray-500">Actual</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <RadialBarChart
              width={320}
              height={320}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={18}
              data={gaugeData}
              startAngle={225}
              endAngle={-45}
            >
              <PolarAngleAxis type="number" domain={[0, maxValue]} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={10} />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold fill-gray-900"
              >
                {lastValue}
              </text>
              <text
                x="50%"
                y="62%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-gray-500"
              >
                Valor actual
              </text>
            </RadialBarChart>
            <p className="text-xs text-gray-500 mt-2">Máximo referencia: {maxValue}</p>
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

        {!isLive && (
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
        )}
      </div>

      {isLive ? (
        <div className="relative">
          <div
            ref={containerRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
          >
            {activeSeriesList.map((series) => {
              const lastReading = series.data && series.data.length > 0 ? series.data[series.data.length - 1] : null;
              const color = COLORS[activeIndex % COLORS.length].stroke;
              const sensor = sensors.find(s => s.id === series.sensorId || s.nombre === series.name);
              const realTimeData = sensor ? getFormattedSensorData(sensor.id) : null;
              const isPump = sensor && (sensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') ||
                sensor.nombre?.toLowerCase().includes('bomba'));
              const currentValue = realTimeData ? realTimeData.value : (lastReading ? lastReading.valor : null);
              const isDisconnected = realTimeData?.estado === 'DESCONECTADO' || sensor?.estado === 'DESCONECTADO';
              const displayValue = isDisconnected ? 'DESCONECTADO' : (isPump && currentValue !== null ? (Number(currentValue) === 1 ? 'Prendido' : 'Apagado') : currentValue);
              const statusColor = isPump ? (Number(currentValue) === 1 ? 'text-green-600' : 'text-red-600') : { color };

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
                          {sensor && sensor.protocolo === 'MQTT' && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="text-xs text-gray-500 capitalize">
                                {connectionStatus === 'connected' ? 'En línea' : 'Desconectado'}
                              </span>
                            </div>
                          )}
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
                      <div className="h-[170px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={series.data.slice(-80)} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
                            {renderGradients()}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
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
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} width={50} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="valor"
                              stroke={color}
                              fill={COLORS[activeIndex % COLORS.length].fill}
                              strokeWidth={3}
                              dot={false}
                              animationDuration={500}
                              isAnimationActive={false}
                              connectNulls
                            />
                          </AreaChart>
                        </ResponsiveContainer>
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
