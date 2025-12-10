import { api } from '../../../shared/api/client';
import type { IoTConfig, Sensor, SensorLectura, TipoSensor } from '../model/iot.types';

export interface GeneralReportFilters {
  loteId?: number;
  startDate?: string;
  endDate?: string;
}

export const IoTApi = {
  // Config
  getConfig: async (): Promise<IoTConfig | null> => {
    try {
      const response = await api.get('/iot/config');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching IoT config:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch IoT config: ${error.message || 'Unknown error'}`);
    }
  },

  saveConfig: async (payload: Partial<IoTConfig>): Promise<{ config: IoTConfig }> => {
    try {
      const response = await api.put('/iot/config', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error saving IoT config:', error);
      throw new Error(`Failed to save IoT config: ${error.message || 'Unknown error'}`);
    }
  },

  testConfig: async (payload: Partial<IoTConfig>): Promise<{ ok: boolean; message: string }> => {
    try {
      const response = await api.post('/iot/config/test-connection', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error testing IoT config:', error);
      return { ok: false, message: `Connection failed: ${error.message || 'Unknown error'}` };
    }
  },

  // Global Configs
  getGlobalConfigs: async (): Promise<IoTConfig[]> => {
    try {
      const response = await api.get('/api/v1/iot/global-configs');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching global configs:', error);
      throw new Error(`Failed to fetch global configs: ${error.message || 'Unknown error'}`);
    }
  },

  createGlobalConfig: async (payload: Partial<IoTConfig>): Promise<IoTConfig> => {
    try {
      const response = await api.post('/api/v1/iot/global-configs', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error creating global config:', error);
      throw new Error(`Failed to create global config: ${error.message || 'Unknown error'}`);
    }
  },

  updateGlobalConfig: async (id: number, payload: Partial<IoTConfig>): Promise<IoTConfig> => {
    try {
      const response = await api.patch(`/api/v1/iot/global-configs/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating global config ${id}:`, error);
      throw new Error(`Failed to update global config: ${error.message || 'Unknown error'}`);
    }
  },

  deleteGlobalConfig: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/api/v1/iot/global-configs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting global config ${id}:`, error);
      throw new Error(`Failed to delete global config: ${error.message || 'Unknown error'}`);
    }
  },

  // Sensors
  getSensors: async (params?: { loteId?: number; subLoteId?: number }): Promise<Sensor[]> => {
    try {
      const response = await api.get('/iot/sensors', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sensors:', error);
      throw new Error(`Failed to fetch sensors: ${error.message || 'Unknown error'}`);
    }
  },

  getSensor: async (id: number): Promise<Sensor> => {
    try {
      const response = await api.get(`/iot/sensors/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching sensor ${id}:`, error);
      throw new Error(`Failed to fetch sensor: ${error.message || 'Unknown error'}`);
    }
  },

  createSensor: async (payload: Partial<Sensor>): Promise<Sensor> => {
    try {
      const response = await api.post('/iot/sensors', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error creating sensor:', error);
      throw new Error(`Failed to create sensor: ${error.message || 'Unknown error'}`);
    }
  },

  updateSensor: async (id: number, payload: Partial<Sensor>): Promise<Sensor> => {
    try {
      const response = await api.patch(`/iot/sensors/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating sensor ${id}:`, error);
      throw new Error(`Failed to update sensor: ${error.message || 'Unknown error'}`);
    }
  },

  toggleSensor: async (id: number): Promise<Sensor> => {
    try {
      const response = await api.patch(`/iot/sensors/${id}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error(`Error toggling sensor ${id}:`, error);
      throw new Error(`Failed to toggle sensor: ${error.message || 'Unknown error'}`);
    }
  },

  deleteSensor: async (id: number): Promise<{ message: string; id: number }> => {
    try {
      const response = await api.delete(`/iot/sensors/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting sensor ${id}:`, error);
      throw new Error(`Failed to delete sensor: ${error.message || 'Unknown error'}`);
    }
  },

  getSensorReadings: async (
    sensorId: number,
    options?: { limit?: number; from?: string; to?: string }
  ): Promise<SensorLectura[]> => {
    try {
      const response = await api.get(`/iot/sensors/${sensorId}/readings`, { params: options });

      // Transform backend response to frontend format
      return response.data.map((reading: any) => ({
        ...reading,
        fechaLectura: reading.fecha, // Map 'fecha' to 'fechaLectura'
        valor: parseFloat(reading.valor) // Convert string to number
      }));
    } catch (error: any) {
      console.error(`Error fetching sensor readings for ${sensorId}:`, error);
      throw new Error(`Failed to fetch sensor readings: ${error.message || 'Unknown error'}`);
    }
  },

  getAggregatedReadings: async (
    sensorId: number,
    params: { from: string; to: string; interval: 'hour' | 'day' | 'week' }
  ): Promise<{ fecha: string; promedio: number; min: number; max: number }[]> => {
    try {
      const response = await api.get(`/iot/sensors/${sensorId}/aggregated`, { params });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching aggregated readings for ${sensorId}:`, error);
      throw new Error(`Failed to fetch aggregated readings: ${error.message || 'Unknown error'}`);
    }
  },

  getBulkAggregatedReadings: async (
    sensorIds: number[],
    params: { from: string; to: string; interval: 'hour' | 'day' | 'week' }
  ): Promise<Record<number, any[]>> => {
    try {
      const response = await api.post('/iot/readings/bulk', {
        sensorIds,
        ...params
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching bulk readings:', error);
      throw new Error(`Failed to fetch bulk readings: ${error.message || 'Unknown error'}`);
    }
  },

  getSensorTypes: async (): Promise<TipoSensor[]> => {
    try {
      const response = await api.get('/iot/sensor-types');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sensor types:', error);
      throw new Error(`Failed to fetch sensor types: ${error.message || 'Unknown error'}`);
    }
  },

  createSensorType: async (payload: Partial<TipoSensor>): Promise<TipoSensor> => {
    try {
      const response = await api.post('/iot/sensor-types', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error creating sensor type:', error);
      throw new Error(`Failed to create sensor type: ${error.message || 'Unknown error'}`);
    }
  },

  updateSensorType: async (id: number, payload: Partial<TipoSensor>): Promise<TipoSensor> => {
    try {
      const response = await api.patch(`/iot/sensor-types/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating sensor type ${id}:`, error);
      throw new Error(`Failed to update sensor type: ${error.message || 'Unknown error'}`);
    }
  },

  deleteSensorType: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/iot/sensor-types/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting sensor type ${id}:`, error);
      throw new Error(`Failed to delete sensor type: ${error.message || 'Unknown error'}`);
    }
  },

  getGeneralReport: async (params: { loteId?: number; startDate?: string; endDate?: string; sensorId?: number }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.loteId) queryParams.append('loteId', params.loteId.toString());
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.sensorId) queryParams.append('sensorId', params.sensorId.toString());

      const response = await api.get(`/iot/general-report?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching general report:', error);
      throw new Error(`Failed to fetch general report: ${error.message || 'Unknown error'}`);
    }
  },

  exportIotReport: async (params: {
    type?: 'aggregation' | 'comparison';
    sensorId?: number;
    loteId?: number;
    cultivoId?: number;
    tipoSensorId?: number;
    from?: string;
    to?: string;
    interval?: 'hour' | 'day' | 'week';
    metric?: 'avg' | 'min' | 'max';
  }) => {
    const query = new URLSearchParams();
    query.append('type', params.type || 'aggregation');
    if (params.sensorId) query.append('sensorId', params.sensorId.toString());
    if (params.loteId) query.append('loteId', params.loteId.toString());
    if (params.cultivoId) query.append('cultivoId', params.cultivoId.toString());
    if (params.tipoSensorId) query.append('tipoSensorId', params.tipoSensorId.toString());
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.interval) query.append('interval', params.interval);
    if (params.metric) query.append('metric', params.metric);

    const response = await api.get(`/reports/iot/export?${query.toString()}`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  exportIotPdf: async (params: { loteId?: number; sensorId?: number; from?: string; to?: string }) => {
    const query = new URLSearchParams();
    if (params.loteId) query.append('loteId', params.loteId.toString());
    if (params.sensorId) query.append('sensorId', params.sensorId.toString());
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const response = await api.get(`/reports/iot/export-pdf?${query.toString()}`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  getLotsComparison: async (params?: {
    loteIds?: number[];
    tipoSensorId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    try {
      const queryParams: any = {};
      if (params?.loteIds && params.loteIds.length > 0) {
        queryParams.loteIds = params.loteIds.join(',');
      }
      if (params?.tipoSensorId) {
        queryParams.tipoSensorId = params.tipoSensorId;
      }
      if (params?.startDate) {
        queryParams.startDate = params.startDate;
      }
      if (params?.endDate) {
        queryParams.endDate = params.endDate;
      }

      const response = await api.get('/iot/comparison', { params: queryParams });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching lots comparison:', error);
      throw new Error(`Failed to fetch lots comparison: ${error.message || 'Unknown error'}`);
    }
  },

  // Actuators/Control
  controlPump: async (sensorId: number, action: 'on' | 'off' | 'toggle'): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(`/iot/sensors/${sensorId}/control`, { action });
      return response.data;
    } catch (error: any) {
      console.error(`Error controlling pump ${sensorId}:`, error);
      throw new Error(`Failed to control pump: ${error.message || 'Unknown error'}`);
    }
  },

  getActuatorStatus: async (sensorId: number): Promise<{ status: 'on' | 'off'; lastUpdated: string }> => {
    try {
      const response = await api.get(`/iot/sensors/${sensorId}/status`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching actuator status for ${sensorId}:`, error);
      throw new Error(`Failed to fetch actuator status: ${error.message || 'Unknown error'}`);
    }
  },

  getAlerts: async (params?: { loteId?: number; sensorId?: number; from?: string; to?: string }) => {
    try {
      const query: any = {};
      if (params?.loteId) query.loteId = params.loteId;
      if (params?.sensorId) query.sensorId = params.sensorId;
      if (params?.from) query.from = params.from;
      if (params?.to) query.to = params.to;
      const response = await api.get('/iot/alerts', { params: query });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      throw new Error(`Failed to fetch alerts: ${error.message || 'Unknown error'}`);
    }
  },

  getAlertContext: async (alertId: number): Promise<{ alert: any; context: SensorLectura[] }> => {
    try {
      const response = await api.get(`/iot/alerts/${alertId}/context`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching alert context for ${alertId}:`, error);
      throw new Error(`Failed to fetch alert context: ${error.message || 'Unknown error'}`);
    }
  },
};

