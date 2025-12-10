import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { IoTFilters } from '../widgets/IoTFilters';
import { Activity, FileText, Wifi, WifiOff, BarChart3, MapPin } from 'lucide-react';
import { api } from '../../../shared/api/client';
import type { Sensor } from '../model/iot.types';
import { useIoTReportGenerator } from '../hooks/useIoTReportGenerator';
import { useIoTLotCharts } from '../hooks/useIoTLotCharts';
import { SensorCharts } from '../widgets/SensorCharts';

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

  const [lotes, setLotes] = useState<any[]>([]);
  const [subLotes, setSubLotes] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const { generatePdf, generatingPdf } = useIoTReportGenerator();

  const handleQuickReport = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    generatePdf({ loteId: selectedLoteId, startDate, endDate });
  };

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await api.get('/geo/lotes');
        setLotes(response.data);
      } catch (err) {
        console.error('Error fetching lotes:', err);
      }
    };
    fetchLotes();
  }, []);

  useEffect(() => {
    const fetchSubLotes = async () => {
      if (!selectedLoteId) {
        setSubLotes([]);
        return;
      }
      try {
        const response = await api.get('/geo/sublotes', {
          params: { loteId: selectedLoteId }
        });
        setSubLotes(response.data);
      } catch (err) {
        console.error('Error fetching sublotes:', err);
        setSubLotes([]);
      }
    };
    fetchSubLotes();
  }, [selectedLoteId]);

  const filteredSensors = useMemo(() => {
    if (!selectedLoteId) return sensors;
    return sensors.filter((s) => {
      const matchLote = s.loteId === selectedLoteId;
      const matchSubLote = selectedSubLoteId ? s.subLoteId === selectedSubLoteId : true;
      return matchLote && matchSubLote;
    });
  }, [sensors, selectedLoteId, selectedSubLoteId]);



  const dateRange = useMemo(
    () => ({
      start: new Date(startDate),
      end: new Date(new Date(endDate).setHours(23, 59, 59)),
    }),
    [startDate, endDate]
  );

  const { timeSeriesData, sensorSummaryData, loading, isLive } = useIoTLotCharts(
    filteredSensors,
    selectedLoteId,
    selectedSubLoteId,
    dateRange,
    null,
    true
  );

  const totalSensors = sensors.length;
  const activos = sensors.filter((s) => s.activo).length;
  const desconectados = sensors.filter((s) => s.estadoConexion === 'DESCONECTADO').length;
  const lotesConSensores = new Set(sensors.map((s) => s.loteId)).size;

  const handleQuickDate = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

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
      <Card className="shadow-md border border-gray-100">
        <CardBody className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-gray-800">Tablero General IoT</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="flat" onPress={() => handleQuickDate(7)}>
                7 dias
              </Button>
              <Button size="sm" variant="flat" onPress={() => handleQuickDate(30)}>
                30 dias
              </Button>
              <Button size="sm" variant="flat" onPress={() => handleQuickDate(90)}>
                3 meses
              </Button>
              <Button
                color="primary"
                variant="solid"
                size="sm"
                startContent={<FileText size={16} />}
                onPress={handleQuickReport}
                isLoading={generatingPdf}
              >
                Reporte
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border border-gray-200 bg-gray-50">
              <CardBody className="p-3">
                <p className="text-xs text-gray-500">Sensores totales</p>
                <p className="text-2xl font-bold text-gray-900">{totalSensors}</p>
              </CardBody>
            </Card>
            <Card className="border border-green-200 bg-green-50">
              <CardBody className="p-3">
                <p className="text-xs text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-green-700 flex items-center gap-2">
                  <Wifi className="w-4 h-4" /> {activos}
                </p>
              </CardBody>
            </Card>
            <Card className="border border-red-200 bg-red-50">
              <CardBody className="p-3">
                <p className="text-xs text-gray-500">Desconectados</p>
                <p className="text-2xl font-bold text-red-700 flex items-center gap-2">
                  <WifiOff className="w-4 h-4" /> {desconectados}
                </p>
              </CardBody>
            </Card>
            <Card className="border border-blue-200 bg-blue-50">
              <CardBody className="p-3 space-y-1">
                <p className="text-xs text-gray-500">Lotes con sensores</p>
                <p className="text-xl font-semibold text-gray-800">{lotesConSensores}</p>
                <p className="text-xs text-gray-500">
                  Rango: {startDate} al {endDate}
                </p>
              </CardBody>
            </Card>
          </div>


        </CardBody>
      </Card>

      <IoTFilters
        selectedLoteId={selectedLoteId}
        setSelectedLoteId={setSelectedLoteId}
        selectedSubLoteId={selectedSubLoteId}
        setSelectedSubLoteId={setSelectedSubLoteId}
        lotes={lotes}
        subLotes={subLotes}
      />

      <Card className="shadow-sm border border-gray-200 bg-white">
        <CardBody className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Visión general por sensores
            </h3>
            <Chip size="sm" variant="flat" color="success">
              {loading ? 'Cargando...' : `${timeSeriesData.length} series`}
            </Chip>
          </div>
          <div className="min-h-[360px] md:min-h-[420px]">
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

      {filteredSensors.length === 0 && (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No se encontraron sensores</p>
            <p className="text-gray-300 text-sm">Intente seleccionar otro lote o verifique la conexión</p>
          </div>
        </div>
      )}
    </div>
  );
};
