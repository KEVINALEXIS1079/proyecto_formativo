import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Select, SelectItem, Card, CardBody, Button, Input, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { BarChart3, LineChart, FileSpreadsheet, FileText, Download, Activity, Filter, Search, Power, Edit3, Trash2, Bell } from 'lucide-react';
import { api, connectSocket } from '../../../shared/api/client';
import { useIoTLotCharts } from '../hooks/useIoTLotCharts';
import { SensorCharts } from '../widgets/SensorCharts';
import type { Sensor } from '../model/iot.types';
import { IoTApi } from '../api/iot.api';
import { useIoTRealTimeSensors } from '../hooks/useIoTRealTimeSensors';

export const LotsAnalyticsPage: React.FC = () => {
  const { sensors, refreshSensors, onToggleSensor, onEditSensor, onDeleteSensor } = useOutletContext<any>();
  const [localSensors, setLocalSensors] = useState<Sensor[]>(sensors || []);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportStart, setReportStart] = useState<string>('');
  const [reportEnd, setReportEnd] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [liveAlert, setLiveAlert] = useState<any | null>(null);

  const [lotes, setLotes] = useState<any[]>([]);
  const [subLotes, setSubLotes] = useState<any[]>([]);
  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null);
  const [selectedSubLoteId, setSelectedSubLoteId] = useState<number | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('all');

  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await api.get('/geo/lotes');
        setLotes(response.data);
        if (response.data.length > 0 && !selectedLoteId) {
          setSelectedLoteId(response.data[0].id);
        }
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
        setSelectedSubLoteId(null);
        return;
      }
      try {
        const response = await api.get('/geo/sublotes', {
          params: { loteId: selectedLoteId }
        });
        setSubLotes(response.data);
        setSelectedSubLoteId(null);
      } catch (err: any) {
        setSubLotes([]);
        setSelectedSubLoteId(null);
      }
    };
    fetchSubLotes();
  }, [selectedLoteId]);

  const availableSensors = useMemo(() => {
    if (!selectedLoteId) return [];
    return localSensors.filter((s) => {
      const matchLote = s.loteId === selectedLoteId;
      const matchSubLote = selectedSubLoteId ? s.subLoteId === selectedSubLoteId : true;
      return matchLote && matchSubLote;
    });
  }, [localSensors, selectedLoteId, selectedSubLoteId]);

  const { getFormattedSensorData, realTimeSensors } = useIoTRealTimeSensors(sensors);

  useEffect(() => {
    if (realTimeSensors && realTimeSensors.length > 0) {
      setLocalSensors(realTimeSensors);
    } else {
      setLocalSensors(sensors || []);
    }
  }, [sensors, realTimeSensors]);

  const dateRange = useMemo(
    () => ({
      start: new Date(startDate),
      end: new Date(new Date(endDate).setHours(23, 59, 59)),
    }),
    [startDate, endDate]
  );

  const { timeSeriesData, sensorSummaryData, loading, metrics, isLive } = useIoTLotCharts(
    sensors,
    selectedLoteId,
    selectedSubLoteId,
    dateRange
  );

  const displayedTimeSeries = useMemo(() => {
    if (selectedSensorId === 'all') return timeSeriesData;
    return timeSeriesData.filter((d) => d.sensorId === parseInt(selectedSensorId));
  }, [timeSeriesData, selectedSensorId]);

  const displayedSummary = useMemo(() => {
    if (selectedSensorId === 'all') return sensorSummaryData;
    return sensorSummaryData.filter((d) => d.sensorId === parseInt(selectedSensorId));
  }, [sensorSummaryData, selectedSensorId]);

  const handleQuickDate = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const selectedLoteName = lotes.find((l) => l.id === selectedLoteId)?.nombre || 'Seleccionar Lote';
  const totalSensors = availableSensors.length;
  const activeSeries = displayedTimeSeries.length;

  useEffect(() => {
    // Keep modal defaults synced with filtros actuales
    setReportStart(startDate);
    setReportEnd(endDate);
  }, [startDate, endDate]);

  // Cargar alertas cuando cambie lote/rango
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const from = startDate;
        const to = endDate;
        const data = await IoTApi.getAlerts({
          loteId: selectedLoteId || undefined,
          from,
          to,
        });
        setAlerts(data || []);
      } catch (e) {
        console.error('Error fetching alerts', e);
        setAlerts([]);
      }
    };
    fetchAlerts();
  }, [selectedLoteId, startDate, endDate]);

  // Escuchar alertas en vivo por websocket
  useEffect(() => {
    const socket = connectSocket('/iot');
    const handleAlert = (alerta: any) => {
      if (selectedLoteId && alerta.loteId && alerta.loteId !== selectedLoteId) return;
      setAlerts(prev => [alerta, ...prev].slice(0, 20));
      setLiveAlert(alerta);
      setTimeout(() => setLiveAlert(null), 5000);
    };
    socket.on('sensorAlert', handleAlert);
    return () => {
      socket.off('sensorAlert', handleAlert);
    };
  }, [selectedLoteId]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true);
      const from = reportStart || startDate;
      const to = reportEnd || endDate;
      const commonParams = {
        loteId: selectedLoteId || undefined,
        sensorId: selectedSensorId !== 'all' ? parseInt(selectedSensorId) : undefined,
        from,
        to,
      };
      const blob =
        format === 'pdf'
          ? await IoTApi.exportIotPdf(commonParams)
          : await IoTApi.exportIotReport({
            type: 'aggregation',
            interval: 'day',
            ...commonParams,
          });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `iot_reporte_${from}_al_${to}.${format === 'pdf' ? 'pdf' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exportando reporte', e);
    } finally {
      setExporting(false);
      setReportModalOpen(false);
    }
  };

  const handleToggle = async (sensor: Sensor) => {
    try {
      if (onToggleSensor) {
        await onToggleSensor(sensor.id);
      } else {
        await IoTApi.toggleSensor(sensor.id);
      }
      if (refreshSensors) {
        refreshSensors();
      }
      setLocalSensors((prev) =>
        prev.map((s) => (s.id === sensor.id ? { ...s, activo: !s.activo } : s))
      );
    } catch (e) {
      console.error('Error toggling sensor', e);
    }
  };

  const handleDelete = async (sensor: Sensor) => {
    try {
      if (onDeleteSensor) {
        await onDeleteSensor(sensor.id);
      } else {
        await IoTApi.deleteSensor(sensor.id);
      }
      if (refreshSensors) refreshSensors();
      setLocalSensors((prev) => prev.filter((s) => s.id !== sensor.id));
    } catch (e) {
      console.error('Error deleting sensor', e);
    }
  };

  const aggregateFromSummary = useMemo(() => {
    if (!displayedSummary || displayedSummary.length === 0) return null;
    const avg =
      displayedSummary.reduce((acc: number, s: any) => acc + (s.avg || 0), 0) /
      displayedSummary.length;
    const min = Math.min(...displayedSummary.map((s: any) => s.min ?? Number.POSITIVE_INFINITY));
    const max = Math.max(...displayedSummary.map((s: any) => s.max ?? Number.NEGATIVE_INFINITY));
    return {
      avg: Number.isFinite(avg) ? parseFloat(avg.toFixed(2)) : null,
      min: Number.isFinite(min) ? min : null,
      max: Number.isFinite(max) ? max : null,
    };
  }, [displayedSummary]);

  return (
    <div className="bg-white p-3 md:p-4 space-y-3 md:space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            {selectedLoteId ? `Analitica Lote ${selectedLoteName}` : 'Analitica de Sensores'}
          </h1>
          <p className="text-gray-500 text-sm">Resumen primero, filtros a la vista y secciones en blanco.</p>
        </div>
      </div>
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              <Filter className="w-4 h-4" /> Filtros
            </div>
            <Chip size="sm" color="success" variant="flat">
              {activeSeries} series
            </Chip>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" color="primary" variant="solid" startContent={<Download className="w-4 h-4" />} onPress={() => setReportModalOpen(true)}>
              Reporte
            </Button>
            <Button size="sm" variant="flat" onPress={() => handleQuickDate(7)}>
              7 dias
            </Button>
            <Button size="sm" variant="flat" onPress={() => handleQuickDate(30)}>
              30 dias
            </Button>
            <Button size="sm" variant="flat" onPress={() => handleQuickDate(90)}>
              3 meses
            </Button>
            <Chip size="sm" color={alerts.length > 0 ? 'danger' : 'default'} variant="flat">
              {alerts.length} alertas
            </Chip>
          </div>
          <p className="text-xs text-gray-500">
            Rango actual: <span className="font-semibold text-gray-800">{startDate}</span> al <span className="font-semibold text-gray-800">{endDate}</span>
          </p>
          {liveAlert && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <Bell className="w-4 h-4" />
              <p className="text-xs font-semibold">
                Alerta {liveAlert.tipo === 'LOW' ? 'bajo' : 'alto'} en {liveAlert.sensor?.nombre || `Sensor ${liveAlert.sensorId}`} - Valor {liveAlert.valor} (Umbral {liveAlert.umbral ?? '-'})
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Lote"
              labelPlacement="outside"
              selectedKeys={selectedLoteId ? [selectedLoteId.toString()] : []}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  setSelectedLoteId(val);
                  setSubLotes([]);
                  setSelectedSubLoteId(null);
                  setSelectedSensorId('all');
                }
              }}
            >
              {lotes.map((l: any) => (
                <SelectItem key={l.id}>{l.nombre}</SelectItem>
              ))}
            </Select>

            <Select
              label="SubLote"
              labelPlacement="outside"
              selectedKeys={selectedSubLoteId ? [selectedSubLoteId.toString()] : []}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSelectedSubLoteId(isNaN(val) ? null : val);
              }}
            >
              {subLotes.map((sl: any) => (
                <SelectItem key={sl.id}>{sl.nombre}</SelectItem>
              ))}
            </Select>

            <Select
              label="Sensor"
              labelPlacement="outside"
              selectedKeys={[selectedSensorId]}
              onChange={(e) => setSelectedSensorId(e.target.value)}
            >
              <SelectItem key="all">Todos los sensores</SelectItem>
              {availableSensors.map((s) => (
                <SelectItem key={s.id.toString()}>{s.nombre}</SelectItem>
              ))}
            </Select>
          </div>

        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Resumen por sensor */}
        <div className="lg:col-span-8">
          <Card className="shadow-sm border border-gray-200 bg-white h-full">
            <CardBody className="p-5 space-y-5 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-gray-900">Resumen por sensor</h3>
                </div>
                <Chip size="sm" variant="flat" color="primary">
                  {displayedSummary.length} sensores
                </Chip>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-2 font-medium">Sensor</th>
                      <th className="pb-2 font-medium text-right">Prom</th>
                      <th className="pb-2 font-medium text-right">Min/Max</th>
                      <th className="pb-2 font-medium text-right">Ultima</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedSummary.map((s: any) => (
                      <tr key={s.sensorId} className="hover:bg-gray-50">
                        <td className="py-2 font-semibold text-gray-800">{s.name}</td>
                        <td className="py-2 text-right text-gray-700">{s.avg}</td>
                        <td className="py-2 text-right text-xs">
                          <span className="text-emerald-600">{s.min}</span> / <span className="text-red-500">{s.max}</span>
                        </td>
                        <td className="py-2 text-right text-gray-700">{s.last}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

        </div>

        {/* Columna lateral */}
        <div className="lg:col-span-4">
          <Card className="bg-white border border-gray-200 shadow-sm h-full">
            <CardBody className="space-y-3 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                  <Power className="w-4 h-4" /> Control Sensores
                </div>
                <Chip size="sm" variant="flat" color="secondary">{availableSensors.length}</Chip>
              </div>
              <div className="max-h-72 overflow-auto space-y-2">
                {availableSensors.map((s) => {
                  const realTimeData = getFormattedSensorData(s.id);
                  const estado = realTimeData?.estadoConexion || realTimeData?.estado || s.estadoConexion || s.estado || 'Sin estado';
                  const estadoDisplay = estado === 'CONECTADO' ? 'Conectado' :
                    estado === 'DESCONECTADO' ? 'Desconectado' :
                      estado === 'ERROR' ? 'Error' : estado;
                  return (
                    <div key={s.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.nombre}</p>
                        <p className="text-xs text-gray-500">{s.tipoSensor?.nombre || 'Sensor'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Chip size="sm" variant="flat" color={estado === 'CONECTADO' || estado === 'Conectado' ? 'success' :
                          estado === 'DESCONECTADO' || estado === 'Desconectado' ? 'danger' :
                            estado === 'ERROR' || estado === 'Error' ? 'warning' : 'default'}>
                          {estadoDisplay}
                        </Chip>
                        {onEditSensor && (
                          <Button size="sm" isIconOnly variant="flat" onPress={() => onEditSensor(s)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" isIconOnly variant="flat" color="danger" onPress={() => handleDelete(s)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {alerts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Alertas recientes</p>
                    <Chip size="sm" color="danger" variant="flat">{alerts.length}</Chip>
                  </div>
                  <div className="max-h-48 overflow-auto space-y-1">
                    {alerts.slice(0, 10).map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-red-800">{a.sensor?.nombre || `Sensor ${a.sensorId}`}</p>
                          <p className="text-xs text-red-700">
                            {a.tipo === 'LOW' ? 'Bajo' : 'Alto'}: {a.valor} (umbral {a.umbral ?? '-'})
                          </p>
                        </div>
                        <p className="text-[11px] text-red-600">
                          {new Date(a.fechaAlerta).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

        </div>
      </div>

      <Card className={`shadow-sm border bg-white mt-4 ${alerts.length > 0 ? 'border-red-200' : 'border-gray-200'}`}>
        <CardBody className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {selectedSensorId === 'all' ? (
                <>
                  <BarChart3 className="w-5 h-5 text-emerald-500" /> Todos los sensores
                </>
              ) : (
                <>
                  <LineChart className="w-5 h-5 text-emerald-500" /> Vista individual
                </>
              )}
            </h3>
            <Chip size="sm" variant="flat" color="success">
              {loading ? 'Cargando...' : `${displayedTimeSeries.length} series`}
            </Chip>
          </div>
          <div className="min-h-[360px] md:min-h-[400px]">
            <SensorCharts
              timeSeriesData={displayedTimeSeries}
              sensorSummaryData={displayedSummary}
              loading={loading}
              isLive={isLive}
              sensors={sensors}
            />
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Generar reporte
              </ModalHeader>
              <ModalBody className="space-y-3">
                <p className="text-sm text-gray-600">Elige el rango de fechas para exportar.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="date"
                    label="Desde"
                    value={reportStart}
                    onChange={(e) => setReportStart(e.target.value)}
                  />
                  <Input
                    type="date"
                    label="Hasta"
                    value={reportEnd}
                    onChange={(e) => setReportEnd(e.target.value)}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileSpreadsheet className="w-4 h-4" />
                  Rango seleccionado: {reportStart || startDate} - {reportEnd || endDate}
                </div>
                <div className="flex gap-2">
                  <Button variant="light" onPress={() => setReportModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    color="success"
                    startContent={<FileSpreadsheet className="w-4 h-4" />}
                    isLoading={exporting}
                    onPress={() => handleExport('csv')}
                  >
                    Excel
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<FileText className="w-4 h-4" />}
                    onPress={() => handleExport('pdf')}
                  >
                    PDF
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
