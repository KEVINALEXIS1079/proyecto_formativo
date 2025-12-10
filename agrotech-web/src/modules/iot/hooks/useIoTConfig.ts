import { useState, useEffect, useCallback, useMemo } from 'react';
import { IoTApi } from '../api/iot.api';
import type { IoTConfig, Sensor } from '../model/iot.types';

export const useIoTConfig = () => {
  const [config, setConfig] = useState<IoTConfig | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configData, sensorsData] = await Promise.allSettled([
        IoTApi.getConfig(),
        IoTApi.getSensors()
      ]);

      if (configData.status === 'fulfilled' && configData.value) {
        setConfig(configData.value);
      } else {
        // If config fails or is null, create default config
        const defaultConfig: Partial<IoTConfig> = {
          broker: 'test.mosquitto.org',
          port: 1883,
          protocol: 'mqtt',
          topicPrefix: 'agrotech/',
          defaultTopics: ['temperatura', 'humedadAire', 'humedadSuelo', 'estadoBomba'],
          customTopics: [],
          autoDiscover: true,
          activo: true,
        };
        try {
          const result = await IoTApi.saveConfig(defaultConfig);
          setConfig(result.config);
        } catch (err: any) {
          console.error('Failed to create default IoT config:', err);
          setError(`Failed to initialize IoT config: ${err.message || 'Unknown error'}`);
          setConfig(null);
        }
      }

      if (sensorsData.status === 'fulfilled') {
        setSensors(sensorsData.value);
      } else {
        console.warn('Failed to load sensors:', sensorsData.reason);
        setSensors([]);
        setError('Failed to load sensors, but config loaded successfully');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load IoT data';
      setError(errorMessage);
      console.error('Error loading IoT data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveConfig = useCallback(async (newConfig: Partial<IoTConfig>) => {
    try {
      const result = await IoTApi.saveConfig(newConfig);
      if (result?.config) {
        setConfig(result.config);
        setError(null); // Clear any previous errors
      } else {
        // fallback: reload from API to ensure freshest data
        await loadData();
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save IoT config';
      setError(errorMessage);
      console.error('Error saving IoT config:', err);
      throw err;
    }
  }, [loadData]);

  const refreshSensors = useCallback(async () => {
    try {
      const data = await IoTApi.getSensors();
      setSensors(data);
      setError(null); // Clear sensor-related errors
    } catch (err: any) {
      const errorMessage = `Failed to refresh sensors: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      console.error('Error refreshing sensors:', err);
      throw err;
    }
  }, []);

  return useMemo(() => ({
    config,
    sensors,
    loading,
    error,
    saveConfig,
    refreshSensors,
    reload: loadData
  }), [config, sensors, loading, error, saveConfig, refreshSensors, loadData]);
};
