import React, { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Sensor } from '../model/iot.types';
import { Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Card, CardBody, Spinner } from "@heroui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IoTApi } from '../api/iot.api';

export const LotsComparisonPage: React.FC = () => {
  const { sensors } = useOutletContext<{ sensors: Sensor[] }>();

  const lots = useMemo(() => {
    const uniqueLots = new Set<number>();
    sensors.forEach(s => { if (s.loteId) uniqueLots.add(s.loteId); });
    return Array.from(uniqueLots).sort((a, b) => a - b);
  }, [sensors]);

  const sensorTypes = useMemo(() => {
    const uniqueTypes = new Map<number, { id: number; nombre: string }>();
    sensors.forEach(s => {
      if (s.tipoSensor) {
        uniqueTypes.set(s.tipoSensor.id, { id: s.tipoSensor.id, nombre: s.tipoSensor.nombre });
      }
    });
    return Array.from(uniqueTypes.values());
  }, [sensors]);

  const [selectedLotIds, setSelectedLotIds] = useState<Set<string>>(new Set([]));
  const [selectedTipoSensorId, setSelectedTipoSensorId] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tipoSensorInfo, setTipoSensorInfo] = useState<any>(null);

  useEffect(() => {
    if (selectedLotIds.size === 0) {
      setComparisonData([]);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const loteIds = Array.from(selectedLotIds).map(id => parseInt(id));
        const tipoSensorId = selectedTipoSensorId ? parseInt(selectedTipoSensorId) : undefined;

        const result = await IoTApi.getLotsComparison({
          loteIds,
          tipoSensorId
        });

        setComparisonData(result.comparisonData || []);
        setTipoSensorInfo(result.tipoSensor);
      } catch (error) {
        console.error('Error fetching comparison:', error);
        setComparisonData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [selectedLotIds, selectedTipoSensorId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-xl font-bold">Comparación de Lotes</h2>
        <Select
          className="max-w-xs"
          label="Seleccionar Lotes a Comparar"
          selectionMode="multiple"
          selectedKeys={selectedLotIds}
          onSelectionChange={(keys) => setSelectedLotIds(keys as Set<string>)}
        >
          {lots.map(l => <SelectItem key={l}>{`Lote ${l}`}</SelectItem>)}
        </Select>

        <Select
          className="max-w-xs"
          label="Filtrar por Tipo de Sensor (Opcional)"
          selectedKeys={selectedTipoSensorId ? [selectedTipoSensorId] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            setSelectedTipoSensorId(selected ? String(selected) : '');
          }}
        >
          {[
            <SelectItem key="">Todos los tipos</SelectItem>,
            ...sensorTypes.map(type => (
              <SelectItem key={type.id}>{type.nombre}</SelectItem>
            ))
          ]}
        </Select>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner color="success" label="Cargando datos de comparación..." />
        </div>
      )}

      {!loading && comparisonData.length > 0 ? (
        <>
          {tipoSensorInfo && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600">
                  Comparando: <span className="font-bold">{tipoSensorInfo.nombre}</span> ({tipoSensorInfo.unidad})
                </p>
              </CardBody>
            </Card>
          )}

          <div className="h-[400px] bg-white p-4 rounded-2xl shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="loteNombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="metric"
                  name={tipoSensorInfo ? `${tipoSensorInfo.nombre} (Promedio)` : "Métrica Promedio"}
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table aria-label="Tabla de Comparación">
            <TableHeader>
              <TableColumn>LOTE</TableColumn>
              <TableColumn>MÉTRICA (PROM)</TableColumn>
              <TableColumn>SENSORES</TableColumn>
              <TableColumn>ESTADO</TableColumn>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.loteId}>
                  <TableCell>{row.loteNombre}</TableCell>
                  <TableCell className="font-bold text-lg">{row.metric}</TableCell>
                  <TableCell>{row.activos}/{row.totalSensores} activos</TableCell>
                  <TableCell>
                    {row.isBest && <Chip color="success" variant="flat">Más Alto</Chip>}
                    {row.isWorst && <Chip color="danger" variant="flat">Más Bajo</Chip>}
                    {!row.isBest && !row.isWorst && <Chip color="default" variant="flat">Promedio</Chip>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : !loading && (
        <div className="text-center py-12 text-gray-400">
          Seleccione al menos un lote para ver comparaciones.
        </div>
      )}
    </div>
  );
};
