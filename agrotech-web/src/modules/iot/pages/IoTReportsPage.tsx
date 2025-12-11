import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Sensor } from '../model/iot.types';
import { Select, SelectItem, Button, Input, Spinner } from "@heroui/react";
import { FileText, FileSpreadsheet } from "lucide-react";
import { useIoTLotCharts } from '../hooks/useIoTLotCharts';
import { buildLotReportCsv, downloadCsv } from '../utils/iot.utils';
import { useIoTReportGenerator } from '../hooks/useIoTReportGenerator';

export const IoTReportsPage: React.FC = () => {
  const { sensors } = useOutletContext<{ sensors: Sensor[] }>();

  const lots = useMemo(() => {
    const uniqueLots = new Set<number>();
    sensors.forEach(s => { if (s.loteId) uniqueLots.add(s.loteId); });
    return Array.from(uniqueLots).sort((a, b) => a - b);
  }, [sensors]);

  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);

  const availableSensors = useMemo(() => {
    if (!selectedLoteId) return [];
    return sensors.filter(s => s.loteId === selectedLoteId);
  }, [sensors, selectedLoteId]);
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const { generatePdf, generatingPdf } = useIoTReportGenerator();

  // Reuse the chart hook to get data for the report
  const { metrics, readings, loading } = useIoTLotCharts(
    sensors,
    selectedLoteId,
    null,
    undefined,
    selectedSensorId
  );

  const handleExportCsv = () => {
    if (!metrics || !readings) return;

    // Flatten readings for export
    const allReadings = Object.values(readings).flat();
    const csvContent = buildLotReportCsv([metrics], allReadings);
    downloadCsv(csvContent, `iot-report-lote-${selectedLoteId}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleGeneratePdf = () => {
    generatePdf({
      loteId: selectedLoteId,
      startDate,
      endDate,
      sensorId: selectedSensorId
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Generar Reportes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Select
            label="Seleccionar Lote"
            selectedKeys={selectedLoteId ? [selectedLoteId.toString()] : ['all']}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedLoteId(val === 'all' ? null : parseInt(val));
              setSelectedSensorId(null); // Reset sensor when lot changes
            }}
          >
            {[
              <SelectItem key="all">Todos los Lotes (Reporte General)</SelectItem>,
              ...lots.map(l => <SelectItem key={l}>{`Lote ${l}`}</SelectItem>)
            ]}
          </Select>

          {selectedLoteId && (
            <Select
              label="Seleccionar Sensor (Opcional)"
              selectedKeys={selectedSensorId ? [selectedSensorId.toString()] : []}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSelectedSensorId(isNaN(val) ? null : val);
              }}
              placeholder="Todos los sensores del lote"
            >
              {[
                <SelectItem key="">Todos los sensores</SelectItem>,
                ...availableSensors.map(s => (
                  <SelectItem key={s.id}>{`${s.nombre} (${s.tipoSensor?.nombre})`}</SelectItem>
                ))
              ]}
            </Select>
          )}

          <div className="flex gap-2">
            <Input
              type="date"
              label="Fecha Inicio"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="Fecha Fin"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-2">Vista Previa</h4>
            {loading ? (
              <div className="flex justify-center py-2">
                <Spinner color="success" label="Cargando datos..." />
              </div>
            ) : metrics ? (
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Lote:</strong> {metrics.loteNombre}</p>
                <p><strong>Total de Lecturas:</strong> {metrics.count}</p>
                <p><strong>Valor Promedio:</strong> {metrics.avg}</p>
                <p><strong>Rango de Fechas:</strong> {startDate} a {endDate}</p>
              </div>
            ) : (
              <p className="text-blue-700">No hay datos disponibles para los criterios seleccionados.</p>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              color="success"
              variant="flat"
              startContent={<FileSpreadsheet size={20} />}
              onPress={handleExportCsv}
              isDisabled={loading || !metrics}
            >
              Exportar CSV
            </Button>

            <Button
              color="danger"
              variant="flat"
              startContent={<FileText size={20} />}
              onPress={handleGeneratePdf}
              isLoading={generatingPdf}
            >
              Generar Reporte PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
