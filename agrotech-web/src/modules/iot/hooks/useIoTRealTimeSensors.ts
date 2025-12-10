import { useState, useEffect, useCallback, useMemo } from 'react';
import { connectSocket } from '../../../shared/api/client';
import type { Sensor } from '../model/iot.types';

type RealTimeEntry = {
  value: number | null;
  timestamp: string;
  estadoConexion?: string | null;
  estado?: string | null;
};

// Time window for data retention (5 minutes for real-time view)
const REAL_TIME_WINDOW_MS = 5 * 60 * 1000;

const parseValue = (valor: any): number | null => {
  if (valor === undefined || valor === null) return null;
  const parsed = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (typeof parsed !== 'number' || Number.isNaN(parsed)) return null;
  return parsed;
};

export const useIoTRealTimeSensors = (sensors: Sensor[]) => {
  const [realTimeData, setRealTimeData] = useState<Record<number, RealTimeEntry>>({});
  const [realTimeSensors, setRealTimeSensors] = useState<Sensor[]>(sensors);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  // Filter sensors that are active and have MQTT/WebSocket protocol
  const activeSensors = useMemo(() => {
    return realTimeSensors.filter(sensor =>
      sensor.activo &&
      (sensor.protocolo === 'MQTT' || sensor.protocolo === 'WEBSOCKET')
    );
  }, [realTimeSensors]);

  // Clean up old data periodically
  const cleanupOldData = useCallback(() => {
    const now = Date.now();
    setRealTimeData(prev => {
      const cleaned: Record<number, RealTimeEntry> = {};
      Object.entries(prev).forEach(([sensorId, data]) => {
        const dataTime = new Date(data.timestamp).getTime();
        if ((now - dataTime) <= REAL_TIME_WINDOW_MS) {
          cleaned[parseInt(sensorId)] = data;
        }
      });
      return cleaned;
    });
  }, []);

  useEffect(() => {
    setRealTimeSensors(sensors);
  }, [sensors]);

  useEffect(() => {
    if (activeSensors.length === 0) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    const socket = connectSocket('/iot');

    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('error');
    });

    const handleNuevaLectura = (lectura: any) => {
      const sensorId = lectura.sensorId;
      const isActiveSensor = activeSensors.some(s => s.id === sensorId);
      if (!isActiveSensor) return;

      const matchingSensor = realTimeSensors.find(s => s.id === sensorId);
      const parsedValue = parseValue(lectura.valor);
      const timestamp = lectura.fecha || lectura.fechaLectura || new Date().toISOString();

      setRealTimeData(prev => ({
        ...prev,
        [sensorId]: {
          value: parsedValue,
          timestamp,
          estadoConexion: lectura.estadoConexion || lectura.estado || matchingSensor?.estadoConexion || prev[sensorId]?.estadoConexion || null,
          estado: lectura.estado || matchingSensor?.estado || prev[sensorId]?.estado || null,
        }
      }));
    };

    const handleSensorUpdated = (updatedSensor: Sensor) => {
      setRealTimeSensors(prev => {
        const exists = prev.some(s => s.id === updatedSensor.id);
        if (exists) {
          return prev.map(s => s.id === updatedSensor.id ? updatedSensor : s);
        }
        return [...prev, updatedSensor];
      });

      setRealTimeData(prev => ({
        ...prev,
        [updatedSensor.id]: {
          value: prev[updatedSensor.id]?.value ?? parseValue(updatedSensor.ultimoValor),
          timestamp: new Date().toISOString(),
          estadoConexion: updatedSensor.estadoConexion ?? prev[updatedSensor.id]?.estadoConexion ?? null,
          estado: updatedSensor.estado ?? prev[updatedSensor.id]?.estado ?? null,
        }
      }));
    };

    socket.on('nuevaLectura', handleNuevaLectura);
    socket.on('sensorUpdated', handleSensorUpdated);

    // Cleanup interval: Remove stale data every 2 minutes
    const cleanupInterval = setInterval(cleanupOldData, 2 * 60 * 1000);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('nuevaLectura', handleNuevaLectura);
      socket.off('sensorUpdated', handleSensorUpdated);
      clearInterval(cleanupInterval);
    };
  }, [activeSensors, cleanupOldData, realTimeSensors]);

  // Get real-time data for a specific sensor
  const getSensorRealTimeData = useCallback((sensorId: number) => {
    return realTimeData[sensorId] || null;
  }, [realTimeData]);

  // Get formatted data for UI display
  const getFormattedSensorData = useCallback((sensorId: number) => {
    const data = realTimeData[sensorId];
    const sensor = realTimeSensors.find(s => s.id === sensorId);

    if (!data && !sensor) return null;

    const unit = sensor?.tipoSensor?.unidad || '';
    const value = data?.value ?? parseValue(sensor?.ultimoValor);
    const timestamp = data?.timestamp || sensor?.ultimaLectura || sensor?.updatedAt || sensor?.createdAt || new Date().toISOString();
    const estadoConexion = data?.estadoConexion ?? sensor?.estadoConexion ?? null;
    const estado = data?.estado ?? sensor?.estado ?? null;

    return {
      value,
      unit,
      timestamp,
      formattedValue: value !== null && value !== undefined && !Number.isNaN(Number(value)) ? `${Number(value).toFixed(1)} ${unit}`.trim() : '--',
      timeAgo: timestamp ? getTimeAgo(timestamp) : 'Sin datos',
      estadoConexion,
      estado,
    };
  }, [realTimeData, realTimeSensors]);

  return {
    realTimeData,
    connectionStatus,
    activeSensors,
    realTimeSensors,
    getSensorRealTimeData,
    getFormattedSensorData,
    cleanupOldData
  };
};

// Helper function to format time ago
function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHour < 24) return `hace ${diffHour}h`;
  return time.toLocaleDateString('es-ES');
}
