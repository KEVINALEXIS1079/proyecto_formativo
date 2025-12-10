import { useState, useEffect, useMemo } from 'react';
import { connectSocket, api } from '../../../shared/api/client';
import { IoTApi } from '../api/iot.api';
import type { Sensor, SensorLectura, LotMetrics } from '../model/iot.types';

// Time window for data retention (2 minutes)
const TWO_MINUTES_MS = 2 * 60 * 1000;
const MAX_LIVE_READINGS = 30; // Cap live points per sensor to avoid heavy renders

// Helper function to filter readings by time window
const filterRecentReadings = (readings: SensorLectura[]): SensorLectura[] => {
  const now = Date.now();
  return readings.filter(r => {
    const readingTime = new Date(r.fechaLectura).getTime();
    return (now - readingTime) <= TWO_MINUTES_MS;
  });
};

const capLiveReadings = (readings: SensorLectura[]): SensorLectura[] => {
  if (readings.length > MAX_LIVE_READINGS) {
    return readings.slice(-MAX_LIVE_READINGS);
  }
  return readings;
};

export const useIoTLotCharts = (
  sensors: Sensor[],
  selectedLoteId: number | null,
  selectedSubLoteId: number | null,
  dateRange?: { start: Date; end: Date },
  selectedSensorId?: number | null,
  includeAllWhenNoLote: boolean = false
) => {
  const [loading, setLoading] = useState(false);
  const [readings, setReadings] = useState<Record<number, SensorLectura[]>>({});
  // State for summaries
  const [summaries, setSummaries] = useState<Record<number, any>>({});

  // Keep only sensors that belong to the selected lot/sub-lot/sensor
  const activeSensors = useMemo(() => {
    if (!selectedLoteId) {
      if (!includeAllWhenNoLote) return [];
      return sensors;
    }

    return sensors.filter((sensor) => {
      const sameLote = sensor.loteId === selectedLoteId;
      const sameSubLote = selectedSubLoteId ? sensor.subLoteId === selectedSubLoteId : true;
      const sameSensor = selectedSensorId ? sensor.id === selectedSensorId : true;
      return sameLote && sameSubLote && sameSensor;
    });
  }, [sensors, selectedLoteId, selectedSubLoteId, selectedSensorId]);

  const isLive = useMemo(() => {
    if (!dateRange) return true;
    const now = new Date();
    return now >= dateRange.start && now <= dateRange.end;
  }, [dateRange]);

  useEffect(() => {
    if (activeSensors.length === 0) {
        setReadings({});
        setSummaries({});
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      const newReadings: Record<number, SensorLectura[]> = {};
      const newSummaries: Record<number, any> = {};
      
      try {
        await Promise.all(activeSensors.map(async (sensor) => {
          // 1. Fetch Readings
          const options: any = { limit: 100 };
          if (dateRange) {
            options.from = dateRange.start.toISOString();
            options.to = dateRange.end.toISOString();
            delete options.limit;
          }
          const data = await IoTApi.getSensorReadings(sensor.id, options);
          // Apply time-based filtering for live mode
          const reversedData = data.reverse();
          newReadings[sensor.id] = isLive
            ? capLiveReadings(filterRecentReadings(reversedData))
            : reversedData;

          // 2. Fetch Summary (if sensor has type)
          if (sensor.tipoSensorId) {
             const summaryParams: any = {
               tipoSensorId: sensor.tipoSensorId,
               from: dateRange ? dateRange.start.toISOString() : '2020-01-01',
               to: dateRange ? dateRange.end.toISOString() : '2030-12-31'
             };
             
             try {
               const summaryRes = await api.get('/reports/iot/summary', { params: summaryParams });
               newSummaries[sensor.id] = summaryRes.data;
             } catch (e) {
               console.warn(`Could not fetch summary for sensor ${sensor.id}`, e);
             }
          }
        }));
        setReadings(newReadings);
        setSummaries(newSummaries);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const socket = connectSocket('/iot');
    
    const handleNuevaLectura = (lectura: any) => {
      const isActiveSensor = activeSensors.some(s => s.id === lectura.sensorId);
      if (!isActiveSensor) return;

      setReadings(prev => {
        const sensorReadings = prev[lectura.sensorId] || [];
        const transformedLectura = {
          ...lectura,
          fechaLectura: lectura.fecha || lectura.fechaLectura,
          valor: typeof lectura.valor === 'string' ? parseFloat(lectura.valor) : lectura.valor
        };
        // Add new reading and filter by time window
        const updated = capLiveReadings(
          filterRecentReadings([...sensorReadings, transformedLectura])
        );
        return { ...prev, [lectura.sensorId]: updated };
      });
    };

    socket.on('nuevaLectura', handleNuevaLectura);

    // Cleanup interval: Remove stale data every 30 seconds
    const cleanupInterval = setInterval(() => {
      setReadings(prev => {
        const cleaned: Record<number, SensorLectura[]> = {};
        Object.keys(prev).forEach(sensorIdStr => {
          const sensorId = parseInt(sensorIdStr);
          cleaned[sensorId] = capLiveReadings(filterRecentReadings(prev[sensorId]));
        });
        return cleaned;
      });
    }, 30000); // 30 seconds

    return () => { 
      socket.off('nuevaLectura', handleNuevaLectura);
      clearInterval(cleanupInterval);
    };
  }, [activeSensors, dateRange, isLive]);

  // Compute Metrics (using summaries if available, fallback to readings)
  const metrics: LotMetrics | null = useMemo(() => {
    if (!selectedLoteId) return null;

    // If we have summaries, use them for global aggregation
    const hasSummaries = Object.keys(summaries).length > 0;
    
    if (hasSummaries) {
      // Note: Summary is per TYPE, so this might duplicate if multiple sensors have same type
      // But for "Lot Analysis" it's an approximation. 
      // Ideally we'd sum up totals, but we only have averages.
      // Let's use readings for global aggregation to be safe, 
      // OR rely on the fact that summaries are accurate for the sensor.
      
      // Actually, let's stick to aggregating readings for the LOT metrics
      // because the summary endpoint is per-type, not per-sensor-instance.
    }

    // Fallback to aggregating readings for LOT level metrics
    let totalSum = 0;
    let totalCount = 0;
    let minVal = Infinity;
    let maxVal = -Infinity;

    Object.values(readings).flat().forEach(r => {
      totalSum += r.valor;
      totalCount++;
      if (r.valor < minVal) minVal = r.valor;
      if (r.valor > maxVal) maxVal = r.valor;
    });

    if (totalCount === 0) return null;

    return {
      loteId: selectedLoteId,
      subLoteId: selectedSubLoteId,
      loteNombre: `Lote ${selectedLoteId}`,
      subLoteNombre: selectedSubLoteId ? `SubLote ${selectedSubLoteId}` : undefined,
      avg: parseFloat((totalSum / totalCount).toFixed(2)),
      min: minVal,
      max: maxVal,
      count: totalCount
    };
  }, [readings, selectedLoteId, selectedSubLoteId, summaries]);

  // Prepare Chart Data
  const timeSeriesData = useMemo(() => {
    return activeSensors.map(sensor => {
      const tipoSensor = sensor.tipoSensor?.nombre || 'Sensor';
      return {
        name: sensor.nombre || tipoSensor,
        sensorId: sensor.id,
        data: readings[sensor.id] || []
      };
    });
  }, [activeSensors, readings]);

  // Summary per Sensor (Using API Summary)
  const sensorSummaryData = useMemo(() => {
    return activeSensors.map(sensor => {
      const sensorReadings = readings[sensor.id] || [];
      const summary = summaries[sensor.id];
      const lastReading = sensorReadings.length > 0 ? sensorReadings[sensorReadings.length - 1].valor : 0;

      // Use API summary when available (backend already respects the provided range)
      if (summary) {
        const summaryAvg = summary.promedio;
        const summaryMin = summary.lecturaMinima?.valor ?? null;
        const summaryMax = summary.lecturaMaxima?.valor ?? null;

        // Guard against incomplete summary responses
        if (summaryMin === null || summaryMax === null || summaryAvg === null || summaryAvg === undefined) {
          // Fallback to readings if summary is missing required fields
          if (sensorReadings.length === 0) return null;

          const values = sensorReadings.map(r => r.valor);
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          return {
            sensorId: sensor.id,
            name: sensor.nombre,
            avg: parseFloat(avg.toFixed(2)),
            min: Math.min(...values),
            max: Math.max(...values),
            last: values[values.length - 1]
          };
        }

        return {
          sensorId: sensor.id,
          name: sensor.nombre,
          avg: summaryAvg,
          min: summaryMin,
          max: summaryMax,
          last: lastReading
        };
      }

      // Calculate from readings (used when date range is present or summary missing)
      if (sensorReadings.length === 0) return null;
      
      const values = sensorReadings.map(r => r.valor);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      return {
        sensorId: sensor.id,
        name: sensor.nombre,
        avg: parseFloat(avg.toFixed(2)),
        min: min,
        max: max,
        last: values[values.length - 1]
      };
    }).filter(Boolean);
  }, [activeSensors, readings, summaries]);

  return {
    loading,
    metrics,
    timeSeriesData,
    sensorSummaryData,
    readings,
    isLive
  };
};
