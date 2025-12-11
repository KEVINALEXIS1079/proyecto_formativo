import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Select, SelectItem, Card, CardBody, Button, Input, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Badge, Spinner } from '@heroui/react';
import { BarChart3, LineChart, FileSpreadsheet, FileText, Download, Activity, Filter, Search, Power, Edit3, Trash2, Bell, AlertTriangle } from 'lucide-react';
import { api, connectSocket } from '../../../shared/api/client';
import { useIoTLotCharts } from '../hooks/useIoTLotCharts';
import { SensorCharts } from '../widgets/SensorCharts';
import type { Sensor } from '../model/iot.types';
import { IoTApi } from '../api/iot.api';
import { useIoTRealTimeSensors } from '../hooks/useIoTRealTimeSensors';

const MemoizedSensorCharts = React.memo(SensorCharts);

export const LotsAnalyticsPage: React.FC = () => {
  const { sensors, refreshSensors, onEditSensor, onDeleteSensor } = useOutletContext<any>();
  const [localSensors, setLocalSensors] = useState<Sensor[]>(sensors || []);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [reportStart, setReportStart] = useState<string>('');
  const [reportEnd, setReportEnd] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [liveAlert, setLiveAlert] = useState<any | null>(null);

  // Alert Pagination & Filter State
  const [alertFilterSensorId, setAlertFilterSensorId] = useState<string>('all');
  const [alertPage, setAlertPage] = useState<number>(1);

  const filteredAlerts = useMemo(() => {
    if (alertFilterSensorId === 'all') return alerts;
    return alerts.filter(a => {
      // Normalize IDs to string for comparison
      const id1 = a.sensorId?.toString();
      // Check nesting - sometimes backend sends sensor: { id: ... }
      const id2 = a.sensor?.id?.toString();
      const match = id1 === alertFilterSensorId || id2 === alertFilterSensorId;
      return match;
    });
  }, [alerts, alertFilterSensorId]);

  // Derive filter options from actual alerts to ensure all displayed alerts can be filtered
  const alertSensorOptions = useMemo(() => {
    const unique = new Map();
    alerts.forEach(a => {
      const sId = a.sensorId?.toString() || a.sensor?.id?.toString();
      const sName = a.sensor?.nombre || `Sensor ${sId}`;
      if (sId && !unique.has(sId)) {
        unique.set(sId, sName);
      }
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [alerts]);

  const paginatedAlerts = useMemo(() => {
    const start = (alertPage - 1) * 5;
    return filteredAlerts.slice(start, start + 5);
  }, [filteredAlerts, alertPage]);

  const [lotes, setLotes] = useState<any[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(true);
  const [subLotes, setSubLotes] = useState<any[]>([]);
  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null);
  const [selectedSubLoteId, setSelectedSubLoteId] = useState<number | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('all');

  // Historical date state removed for strict Real-Time mode
  // const [startDate, setStartDate] = useState...
  // const [endDate, setEndDate] = useState...

  useEffect(() => {
    let mounted = true;
    const fetchLotes = async (retryCount = 0) => {
      try {
        setLoadingLotes(true);
        const response = await api.get('/geo/lotes/summary');

        if (mounted) {
          if (response.data && response.data.length > 0) {
            setLotes(response.data);
            if (!selectedLoteId) {
              setSelectedLoteId(response.data[0].id);
            }
            setLoadingLotes(false);
          } else if (retryCount < 2) {
            // Retry if empty (maybe auth race condition)
            setTimeout(() => fetchLotes(retryCount + 1), 500);
          } else {
            setLotes([]);
            setLoadingLotes(false);
          }
        }
      } catch (err) {
        console.error('Error fetching lotes:', err);
        if (mounted && retryCount < 2) {
          setTimeout(() => fetchLotes(retryCount + 1), 1000);
        } else if (mounted) {
          setLoadingLotes(false);
        }
      }
    };
    fetchLotes();
    return () => { mounted = false; };
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

  // Force Live Mode (undefined dateRange)
  const dateRange = undefined;

  const { timeSeriesData, sensorSummaryData, loading, isLive } = useIoTLotCharts(
    sensors,
    selectedLoteId,
    selectedSubLoteId,
    dateRange
  );

  const displayedTimeSeries = useMemo(() => {
    if (selectedSensorId === 'all') return timeSeriesData;
    return timeSeriesData.filter((d) => d?.sensorId === parseInt(selectedSensorId));
  }, [timeSeriesData, selectedSensorId]);

  const displayedSummary = useMemo(() => {
    if (selectedSensorId === 'all') return sensorSummaryData;
    return sensorSummaryData.filter((d) => d?.sensorId === parseInt(selectedSensorId));
  }, [sensorSummaryData, selectedSensorId]);

  // handleQuickDate removed

  // Unused handleQuickDate and variables removed
  const selectedLoteName = lotes.find((l) => l.id === selectedLoteId)?.nombre || 'Seleccionar Lote';
  const activeSeries = displayedTimeSeries.length;

  useEffect(() => {
    // Initialize report modal defaults to last 7 days when opened, independently of page state
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    setReportStart(start);
    setReportEnd(end);
  }, []);

  // Cargar alertas cuando cambie lote (Range removed)
  // Cargar alertas: API + LocalStorage
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        // 1. Recover from LocalStorage first to show something immediately
        const cached = localStorage.getItem(`alerts_${selectedLoteId}`);
        if (cached) {
          setAlerts(JSON.parse(cached));
        }

        // 2. Fetch from API (Historical/Recent)
        const data = await IoTApi.getAlerts({
          loteId: selectedLoteId || undefined,
        });

        // 3. Merge: deduplicate by ID if possible, or just replace if API is the source of truth
        // For now, we trust the API. If the API returns empty, we might keep cached if it was live data.
        if (data && data.length > 0) {
          setAlerts(data);
          localStorage.setItem(`alerts_${selectedLoteId}`, JSON.stringify(data));
        }
      } catch (e) {
        console.error('Error fetching alerts', e);
      }
    };
    if (selectedLoteId) {
      loadAlerts();
    }
  }, [selectedLoteId]);

  // Save live alerts to LocalStorage
  useEffect(() => {
    if (alerts.length > 0 && selectedLoteId) {
      localStorage.setItem(`alerts_${selectedLoteId}`, JSON.stringify(alerts.slice(0, 50)));
    }
  }, [alerts, selectedLoteId]);

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
      const from = reportStart || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
      const to = reportEnd || new Date().toISOString().split('T')[0];
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

  // Removed unused handleToggle


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

  // Removed unused aggregateFromSummary


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
            <Button size="sm" variant="ghost" color="primary" onPress={() => window.location.reload()}>
              Recargar Datos
            </Button>
            <Badge content={alerts.length} color="danger" isInvisible={alerts.length === 0} shape="circle">
              <Button isIconOnly variant="flat" onPress={() => setAlertsModalOpen(true)}>
                <Bell className="w-5 h-5 text-gray-600" />
              </Button>
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Vista en Tiempo Real
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
              isLoading={loadingLotes}
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
              )) as any}
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
              )) as any}
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
              )) as any}
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
                  const sAny = s as any;
                  const estado = realTimeData?.estadoConexion || realTimeData?.estado || sAny.estadoConexion || sAny.estado || 'Sin estado';
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
              {loading ? <Spinner size="sm" color="current" /> : `${displayedTimeSeries.length} series`}
            </Chip>
          </div>
          <div className="min-h-[360px] md:min-h-[400px]">
            <MemoizedSensorCharts
              timeSeriesData={displayedTimeSeries}
              sensorSummaryData={displayedSummary}
              loading={loading}
              isLive={isLive}
              sensors={localSensors}
              layout="carousel"
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
                  Rango seleccionado: {reportStart} - {reportEnd}
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

      <Modal isOpen={alertsModalOpen} onClose={() => setAlertsModalOpen(false)} scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Alertas Recientes</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-between items-center mb-2">
                  <div className="w-1/2">
                    <Select
                      label="Filtrar por Sensor"
                      size="sm"
                      placeholder="Todos"
                      selectedKeys={[alertFilterSensorId]}
                      onChange={(e) => {
                        setAlertFilterSensorId(e.target.value || 'all');
                        setAlertPage(1);
                      }}
                    >
                      <SelectItem key="all">Todos</SelectItem>
                      {alertSensorOptions.map(s => <SelectItem key={s.id}>{s.name}</SelectItem>) as any}
                    </Select>
                  </div>
                  <Chip size="sm" variant="flat">{filteredAlerts.length} alertas</Chip>
                </div>
                {paginatedAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No hay alertas recientes</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paginatedAlerts.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between px-3 py-3 bg-red-50/50 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800">{a.sensor?.nombre || `Sensor ${a.sensorId}`}</p>
                            <Chip size="sm" color="danger" variant="flat" className="h-5 text-[10px] px-1">
                              {a.tipo === 'LOW' ? 'Bajo' : 'Alto'}
                            </Chip>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Valor registrado: <span className="font-bold">{a.valor}</span> (Umbral: {a.umbral ?? '-'})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-gray-400">
                            {new Date(a.fechaAlerta).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(a.fechaAlerta).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    disabled={alertPage === 1}
                    onPress={() => setAlertPage(p => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm flex items-center">
                    Pág {alertPage} de {Math.max(1, Math.ceil(filteredAlerts.length / 5))}
                  </span>
                  <Button
                    size="sm"
                    variant="flat"
                    disabled={alertPage * 5 >= filteredAlerts.length}
                    onPress={() => setAlertPage(p => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
                <Button color="primary" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
