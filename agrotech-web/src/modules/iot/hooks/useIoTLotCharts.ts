import { useState, useEffect, useMemo } from 'react';
import { connectSocket, api } from '../../../shared/api/client';
import { IoTApi } from '../api/iot.api';
import type { Sensor, SensorLectura, LotMetrics } from '../model/iot.types';

// Time window for data retention (24 hours for initial live view context)
const LIVE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_LIVE_READINGS = 50; // Increased cap to show more context

// Helper function to filter readings by time window
const filterRecentReadings = (readings: SensorLectura[]): SensorLectura[] => {
  const now = Date.now();
  return readings.filter(r => {
    const readingTime = new Date(r.fechaLectura).getTime();
    return (now - readingTime) <= LIVE_WINDOW_MS;
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
        if (dateRange) {
          // ==============================
          // BULK STRATEGY (High Performance)
          // ==============================
          const diffDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 3600 * 24);
          
          if (diffDays > 2) {
             let interval: 'hour' | 'day' | 'week' = 'day';
             if (diffDays <= 7) interval = 'hour';
             else if (diffDays <= 60) interval = 'day';
             else interval = 'week';

             // 1. Bulk Call
             const sensorIds = activeSensors.map(s => s.id);
             const bulkData = await IoTApi.getBulkAggregatedReadings(sensorIds, {
               from: dateRange.start.toISOString(),
               to: dateRange.end.toISOString(),
               interval
             });

             // 2. Map response
             Object.entries(bulkData).forEach(([sId, data]) => {
                const sensorId = parseInt(sId);
                newReadings[sensorId] = data.map((a: any) => ({
                  id: 0,
                  sensorId: sensorId,
                  valor: a.promedio,
                  fechaLectura: a.fecha, 
                  fecha: a.fecha
                }));
             });
          } else {
             // Short range: Parallel Fetch (still N+1 but acceptable for small data range or implement bulk raw later)
             await Promise.all(activeSensors.map(async (sensor) => {
                const options: any = { 
                   from: dateRange.start.toISOString(),
                   to: dateRange.end.toISOString()
                };
                const data = await IoTApi.getSensorReadings(sensor.id, options);
                newReadings[sensor.id] = data.reverse();
             }));
          }

        } else {
           // ==============================
           // LIVE STRATEGY
           // ==============================
           await Promise.all(activeSensors.map(async (sensor) => {
             const data = await IoTApi.getSensorReadings(sensor.id, { limit: 100 });
             const reversedData = data.reverse();
             newReadings[sensor.id] = capLiveReadings(filterRecentReadings(reversedData));
           }));
        }

        // Fetch Summaries in parallel (optimizable to bulk later if needed)
        // For now, allow these to fail without blocking charts
        activeSensors.forEach(sensor => {
            if (sensor.tipoSensorId) {
                // Fire and forget-ish, or just dont wait for all
                const summaryParams: any = {
                   tipoSensorId: sensor.tipoSensorId,
                   from: dateRange ? dateRange.start.toISOString() : '2020-01-01',
                   to: dateRange ? dateRange.end.toISOString() : '2030-12-31'
                };
                api.get('/reports/iot/summary', { params: summaryParams })
                   .then(res => {
                       setSummaries(prev => ({ ...prev, [sensor.id]: res.data }));
                   })
                   .catch(e => console.warn('Summary fetch failed', e));
            }
        });

        setReadings(newReadings);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (!isLive) return; 

    // Socket logic: Always connect if "isLive" (current time in range), 
    // but ONLY filter by 2 minutes if we are strictly in "No Range" mode.
    const socket = connectSocket('/iot');
    
    const handleNuevaLectura = (lectura: any) => {
      const isActiveSensor = activeSensors.some(s => s.id === lectura.sensorId);
      if (!isActiveSensor) return;

      setReadings(prev => {
        const sensorReadings = prev[lectura.sensorId] || [];
        const transformedLectura = {
          ...lectura,
          fechaLectura: lectura.fecha || lectura.fechaLectura,
          valor: typeof lectura.valor === 'string' ? parseFloat(parseFloat(lectura.valor).toFixed(2)) : parseFloat(Number(lectura.valor).toFixed(2))
        };
        
        let updated = [...sensorReadings, transformedLectura];

        // If explicitly dateRanged, we don't strictly cap to 2 mins, but we might want to cap length to avoid memory leak
        if (!dateRange) {
           updated = capLiveReadings(filterRecentReadings(updated));
        } else {
           // For Ranged views, just ensure we don't hold infinite points. 
           // If we are aggregating, we shouldn't really append raw points blindly, 
           // but for UX it's nicer to see them appear. 
           // We'll keep last 500 to be safe.
           if (updated.length > 500) updated = updated.slice(-500);
        }

        return { ...prev, [lectura.sensorId]: updated };
      });
    };
    
    socket.on('nuevaLectura', handleNuevaLectura);

    // Cleanup interval: Only needed for strict live mode
    const cleanupInterval = setInterval(() => {
       if (dateRange) return; // Don't auto-clean in history mode
       
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
