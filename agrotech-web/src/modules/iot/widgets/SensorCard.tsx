import React from 'react';
import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { Wifi, WifiOff, Power, Edit } from "lucide-react";
import type { Sensor } from "../model/iot.types";
import { useIoTRealTimeSensors } from '../hooks/useIoTRealTimeSensors';

interface SensorCardProps {
  sensor: Sensor;
  onToggle: (id: number) => void;
  onEdit: (sensor: Sensor) => void;
  sensors?: Sensor[];
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensor, onToggle, onEdit, sensors = [] }) => {
  const { getFormattedSensorData, realTimeSensors } = useIoTRealTimeSensors(sensors);
  const liveSensor = realTimeSensors.find(s => s.id === sensor.id) || sensor;
  const realTimeData = getFormattedSensorData(sensor.id);
  const connectionState = realTimeData?.estadoConexion || liveSensor.estadoConexion;
  const isConnected = connectionState === 'CONECTADO';
  const isPump = liveSensor.tipoSensor?.nombre?.toLowerCase().includes('bomba') ||
    liveSensor.nombre?.toLowerCase().includes('bomba');
  const currentValue = realTimeData?.value ?? (liveSensor.ultimoValor !== undefined ? Number(liveSensor.ultimoValor) : undefined);
  const isDeactivated = (realTimeData?.estado || liveSensor.estado)?.toLowerCase() === 'desactivado';
  const displayValue = !isConnected ? 'Desconectado' :
    isDeactivated ? 'Desactivado' :
      (isPump && currentValue !== undefined ? (Number(currentValue) === 1 ? 'Prendido' : 'Apagado') :
        (currentValue !== undefined ? currentValue : '--'));
  const unit = isPump ? '' : (liveSensor.tipoSensor?.unidad || '');

  return (
    <Card className="min-w-[280px] w-[280px] m-2 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
      <CardHeader className="flex justify-between items-start pb-0">
        <div className="flex flex-col">
          <p className="text-tiny uppercase font-bold text-gray-500">{sensor.tipoSensor?.nombre || 'Sensor'}</p>
          <h4 className="font-bold text-large">{sensor.nombre}</h4>
          <small className="text-default-500">
            {sensor.loteId ? `Lote ${sensor.loteId}` : 'Sin lote asignado'}
            {sensor.subLoteId ? ` / Sub ${sensor.subLoteId}` : ''}
          </small>
        </div>
        <Chip
          startContent={isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          variant="flat"
          color={isConnected ? "success" : "danger"}
          size="sm"
        >
          {isConnected ? 'En línea' : 'Desconectado'}
        </Chip>
      </CardHeader>
      <CardBody className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-primary">{displayValue}</span>
            <span className="text-xl text-gray-500 mb-1">{unit}</span>
          </div>
          <div className="flex gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="default"
              onPress={() => onEdit(sensor)}
              className="rounded-full"
            >
              <Edit size={18} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant={sensor.activo ? "solid" : "flat"}
              color={sensor.activo ? "primary" : "default"}
              onPress={() => onToggle(sensor.id)}
              className="rounded-full"
            >
              <Power size={18} />
            </Button>
          </div>
        </div>
        {(realTimeData || sensor.ultimaLectura) && (
          <p className="text-tiny text-gray-400 mt-2">
            Última act.: {realTimeData ? realTimeData.timeAgo : (sensor.ultimaLectura ? new Date(sensor.ultimaLectura).toLocaleTimeString() : 'Sin datos')}
          </p>
        )}
      </CardBody>
    </Card>
  );
};
