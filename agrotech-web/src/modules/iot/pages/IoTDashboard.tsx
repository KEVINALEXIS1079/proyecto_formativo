import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardBody, Button, Chip, Skeleton } from '@heroui/react';
import { IoTFilters } from '../widgets/IoTFilters';
import { Activity, FileText, Wifi, WifiOff, BarChart3, MapPin } from 'lucide-react';
import { api } from '../../../shared/api/client';
import type { Sensor } from '../model/iot.types';
import { useIoTReportGenerator } from '../hooks/useIoTReportGenerator';
import { useIoTLotCharts } from '../hooks/useIoTLotCharts';
import { SensorCharts } from '../widgets/SensorCharts';
import { PendingAlertsList } from '../widgets/PendingAlertsList';


interface IoTContext {
  sensors: Sensor[];
  refreshSensors: () => void;
  onToggleSensor: (id: number) => void;
  onEditSensor: (sensor: Sensor) => void;
}

export const IoTDashboard: React.FC = () => {
  const { sensors } = useOutletContext<IoTContext>();

  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null);
  const [selectedSubLoteId, setSelectedSubLoteId] = useState<number | null>(null);
  
  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(true);

  // Reset auto mode when user interacts
  const handleSetLote = (id: number | null) => {
    setSelectedLoteId(id);
    if (id !== null) {
      setIsAutoMode(false);
    } else {
      setIsAutoMode(true);
      setCarouselIndex(0);
    }
  };

  const [lotes, setLotes] = useState<any[]>([]);
  const [subLotes, setSubLotes] = useState<any[]>([]);
  // Removed historical date state as per requirement
  // const [startDate, setStartDate] = useState...
  // const [endDate, setEndDate] = useState...

  const { generatePdf, generatingPdf } = useIoTReportGenerator();

  const handleQuickReport = () => {
    // Default to last 7 days for the report generation action only
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    generatePdf({ loteId: effectiveLoteId, startDate, endDate });
  };

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await api.get('/geo/lotes/summary');
        setLotes(response.data);
      } catch (err) {
        console.error('Error fetching lotes:', err);
      }
    };
    fetchLotes();
  }, []);

  // Carousel Logic
  useEffect(() => {
    if (!isAutoMode || lotes.length === 0 || selectedLoteId !== null) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % lotes.length);
    }, 20000); // 20 seconds rotation

    return () => clearInterval(interval);
  }, [isAutoMode, lotes.length, selectedLoteId]);

  const effectiveLoteId = selectedLoteId ?? (lotes.length > 0 ? lotes[carouselIndex]?.id : null);

  useEffect(() => {
    const fetchSubLotes = async () => {
      if (!effectiveLoteId) {
        setSubLotes([]);
        return;
      }
      try {
        const response = await api.get('/geo/sublotes', {
          params: { loteId: effectiveLoteId }
        });
        setSubLotes(response.data);
      } catch (err) {
        console.error('Error fetching sublotes:', err);
        setSubLotes([]);
      }
    };
    fetchSubLotes();
  }, [effectiveLoteId]);

  const filteredSensors = useMemo(() => {
    if (!effectiveLoteId) return sensors;
    return sensors.filter((s) => {
      const matchLote = s.loteId === effectiveLoteId;
      const matchSubLote = selectedSubLoteId ? s.subLoteId === selectedSubLoteId : true;
      return matchLote && matchSubLote;
    });
  }, [sensors, effectiveLoteId, selectedSubLoteId]);



  // No date range passed to hook -> triggers Live mode
  const dateRange = undefined;

  const { timeSeriesData, sensorSummaryData, loading, isLive } = useIoTLotCharts(
    filteredSensors,
    effectiveLoteId,
    selectedSubLoteId,
    dateRange,
    null,
    true
  );

  const totalSensors = sensors.length;
  const activos = sensors.filter((s) => s.activo).length;
  const desconectados = sensors.filter((s) => s.estadoConexion === 'DESCONECTADO').length;
  const lotesConSensores = new Set(sensors.map((s) => s.loteId)).size;

  // Removed handleQuickDate function

  // Enriquecer las series con nombre de lote/sublote para que se identifique en la gráfica
  const labeledSeries = useMemo(() => {
    const loteMap = new Map<number | null, string>();
    lotes.forEach((l: any) => loteMap.set(l.id, l.nombre));
    return timeSeriesData.map((serie) => {
      const sensor = filteredSensors.find((s) => s.id === serie.sensorId);
      const loteName = sensor?.loteId ? loteMap.get(sensor.loteId) || `Lote ${sensor.loteId}` : 'Sin lote';
      const sub = sensor?.subLoteId ? ` / Sub ${sensor.subLoteId}` : '';
      return {
        ...serie,
        name: `${loteName}${sub} - ${serie.name || sensor?.nombre || 'Sensor'}`,
      };
    });
  }, [timeSeriesData, filteredSensors, lotes]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-md">
        <CardBody className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100/50 rounded-xl">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tablero General IoT</h2>
                <p className="text-small text-gray-500">Monitoreo en tiempo real de campo</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {/* Removed date filters (7D, 30D, 90D) as requested - strictly Real Time */}
              <Button
                className="bg-gray-900 text-white shadow-md"
                size="sm"
                startContent={<FileText size={16} />}
                onPress={handleQuickReport}
                isLoading={generatingPdf}
              >
                Generar Reporte
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Sensores Totales" value={totalSensors} icon="box" />
            <SummaryCard title="Activos" value={activos} icon="wifi" color="success" />
            <SummaryCard title="Desconectados" value={desconectados} icon="wifi-off" color="danger" />
            <SummaryCard title="Lotes Monitoreados" value={lotesConSensores} icon="map" info="En vivo" />
          </div>
        </CardBody>
      </Card>

      <IoTFilters
        selectedLoteId={effectiveLoteId}
        setSelectedLoteId={handleSetLote}
        selectedSubLoteId={selectedSubLoteId}
        setSelectedSubLoteId={setSelectedSubLoteId}
        lotes={lotes}
        subLotes={subLotes}
        isAutoMode={isAutoMode}
      />

      <Card className="shadow-lg border-0 bg-white">
        <CardBody className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" /> 
              Visión general por sensores
            </h3>
            <Chip size="sm" variant="flat" color={isLive ? "success" : "default"} startContent={isLive ? <Activity size={12}/> : null}>
               {loading ? 'Cargando datos...' : isLive ? 'En vivo' : 'Histórico'}
            </Chip>
          </div>
          
          <div className="min-h-[420px] relative">
             {loading && timeSeriesData.length === 0 && (
                 <div className="absolute inset-0 z-10 flex flex-col gap-4 p-4 bg-white/80 backdrop-blur-sm">
                    <Skeleton className="rounded-lg h-60 w-full"/>
                    <div className="flex gap-4">
                        <Skeleton className="rounded-lg h-24 w-1/3"/>
                        <Skeleton className="rounded-lg h-24 w-1/3"/>
                        <Skeleton className="rounded-lg h-24 w-1/3"/>
                    </div>
                 </div>
             )}
            
            <SensorCharts
              timeSeriesData={labeledSeries}
              sensorSummaryData={sensorSummaryData}
              loading={loading}
              isLive={isLive}
              sensors={filteredSensors}
            />
          </div>
        </CardBody>
      </Card>

      {/* Alerts Section - Collapsible or always visible? Always visible for now */}

      
      <PendingAlertsList loteId={effectiveLoteId} />

      {filteredSensors.length === 0 && (
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="text-center opacity-50">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No se encontraron sensores</p>
            <p className="text-gray-400 text-sm">Selecciona otro lote para visualizar datos</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color = "default", info }: any) => {
    const colors: any = {
        success: "text-emerald-600 bg-emerald-50 border-emerald-100",
        danger: "text-rose-600 bg-rose-50 border-rose-100",
        default: "text-gray-800 bg-gray-50 border-gray-100"
    };

    const icons: any = {
        wifi: <Wifi className="w-5 h-5" />,
        "wifi-off": <WifiOff className="w-5 h-5" />,
        map: <MapPin className="w-5 h-5" />,
        box: <Activity className="w-5 h-5" />
    };

    return (
        <Card className={`border-1 shadow-sm ${colors[color].split(" ")[2]} ${colors[color].split(" ")[1]}`}>
            <CardBody className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                    <div className={`p-1.5 rounded-lg ${colors[color].split(" ")[1]} ${colors[color].split(" ")[0]}`}>
                        {icons[icon]}
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {info && <span className="text-xs text-gray-400">{info}</span>}
                </div>
            </CardBody>
        </Card>
    );
};
