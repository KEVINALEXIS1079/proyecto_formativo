import api from '../../../shared/services/api';
import type { Sensor, SensorLectura, IoTConfig, LotMetrics } from '../model/iot.types';

export const iotAPI = {
    getSensors: (params?: { loteId?: number; subLoteId?: number }) =>
        api.get('/iot/sensors', { params }),

    getSensorReadings: (sensorId: number, params?: { limit?: number; from?: string; to?: string }) =>
        api.get(`/iot/sensors/${sensorId}/readings`, { params }).then(res =>
            res.data.map((r: any) => ({
                ...r,
                fechaLectura: r.fecha || r.fechaLectura,
                valor: parseFloat(r.valor)
            }))
        ),

    getBulkAggregatedReadings: (sensorIds: number[], params: { from: string; to: string; interval: 'hour' | 'day' | 'week' }) =>
        api.post('/iot/readings/bulk', { sensorIds, ...params }).then(res => res.data),

    getAlerts: (params?: { loteId?: number; sensorId?: number; from?: string; to?: string }) =>
        api.get('/iot/alerts', { params }).then(res => res.data),

    getReportsSummary: (params: { tipoSensorId: number; from: string; to: string }) =>
        api.get('/reports/iot/summary', { params }).then(res => res.data),
};
