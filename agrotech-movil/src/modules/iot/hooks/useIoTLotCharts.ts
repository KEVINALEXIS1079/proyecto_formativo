import { useState, useEffect, useMemo } from 'react';
import { iotAPI } from '../services/iot.api';
import type { Sensor, SensorLectura, LotMetrics } from '../model/iot.types';

const LIVE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_LIVE_READINGS = 50;

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
    const [summaries, setSummaries] = useState<Record<number, any>>({});

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

    const fetchData = async () => {
        if (activeSensors.length === 0) {
            setReadings({});
            setSummaries({});
            setLoading(false);
            return;
        }

        // Only set loading on initial fetch if empty
        if (Object.keys(readings).length === 0) setLoading(true);

        const newReadings: Record<number, SensorLectura[]> = {};
        const newSummaries: Record<number, any> = {};

        try {
            if (dateRange) {
                const diffDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 3600 * 24);

                if (diffDays > 2) {
                    let interval: 'hour' | 'day' | 'week' = 'day';
                    if (diffDays <= 7) interval = 'hour';
                    else if (diffDays <= 60) interval = 'day';
                    else interval = 'week';

                    const sensorIds = activeSensors.map(s => s.id);
                    const bulkData = await iotAPI.getBulkAggregatedReadings(sensorIds, {
                        from: dateRange.start.toISOString(),
                        to: dateRange.end.toISOString(),
                        interval
                    });

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
                    await Promise.all(activeSensors.map(async (sensor) => {
                        const options: any = {
                            from: dateRange.start.toISOString(),
                            to: dateRange.end.toISOString()
                        };
                        const data = await iotAPI.getSensorReadings(sensor.id, options);
                        newReadings[sensor.id] = data.reverse();
                    }));
                }

            } else {
                // LIVE STRATEGY
                await Promise.all(activeSensors.map(async (sensor) => {
                    const data = await iotAPI.getSensorReadings(sensor.id, { limit: 100 });
                    // In mobile api wrap, data is already reversed or formatted? 
                    // In web api wrapper: "return response.data.map..."
                    // In my mobile api wrapper: "res.data.map..." but I didn't reverse.
                    // Web version caps live readings.
                    const reversedData = [...data].reverse(); // Ensure chronological order if API returns newest first
                    newReadings[sensor.id] = capLiveReadings(reversedData); // Assuming filterRecentReadings not strictly needed if backend limits
                }));
            }

            // Fetch Summaries
            activeSensors.forEach(sensor => {
                if (sensor.tipoSensorId) {
                    const summaryParams: any = {
                        tipoSensorId: sensor.tipoSensorId,
                        from: dateRange ? dateRange.start.toISOString() : '2020-01-01',
                        to: dateRange ? dateRange.end.toISOString() : '2030-12-31'
                    };
                    iotAPI.getReportsSummary(summaryParams)
                        .then(data => {
                            setSummaries(prev => ({ ...prev, [sensor.id]: data }));
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

    useEffect(() => {
        fetchData();
    }, [activeSensors, dateRange]);

    // Polling for live mode
    useEffect(() => {
        if (!isLive || activeSensors.length === 0 || dateRange) return;

        const interval = setInterval(() => {
            fetchData();
        }, 15000); // Poll every 15s

        return () => clearInterval(interval);
    }, [isLive, activeSensors, dateRange]);


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

    const sensorSummaryData = useMemo(() => {
        return activeSensors.map(sensor => {
            const sensorReadings = readings[sensor.id] || [];
            const summary = summaries[sensor.id];
            const lastReading = sensorReadings.length > 0 ? sensorReadings[sensorReadings.length - 1].valor : 0;

            if (summary) {
                const summaryAvg = summary.promedio;
                const summaryMin = summary.lecturaMinima?.valor ?? null;
                const summaryMax = summary.lecturaMaxima?.valor ?? null;

                if (summaryMin === null || summaryMax === null || summaryAvg === null || summaryAvg === undefined) {
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
        readings,
        timeSeriesData,
        sensorSummaryData,
        isLive
    };
};
