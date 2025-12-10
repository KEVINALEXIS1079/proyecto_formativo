import { useState, useEffect, useCallback, useMemo } from 'react';
import { IoTApi } from '../api/iot.api';
import type { IoTConfig } from '../model/iot.types';
import { toast } from 'react-toastify';

export const useGlobalConfigs = () => {
  const [configs, setConfigs] = useState<IoTConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IoTApi.getGlobalConfigs();
      setConfigs(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load global configs';
      setError(errorMessage);
      console.error('Error loading global configs:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const createConfig = useCallback(async (payload: Partial<IoTConfig>) => {
    try {
      const newConfig = await IoTApi.createGlobalConfig(payload);
      setConfigs(prev => [...prev, newConfig]);
      toast.success('Configuración creada');
      return newConfig;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create config';
      setError(errorMessage);
      console.error('Error creating config:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateConfig = useCallback(async (id: number, payload: Partial<IoTConfig>) => {
    try {
      const updatedConfig = await IoTApi.updateGlobalConfig(id, payload);
      setConfigs(prev => prev.map(config => config.id === id ? updatedConfig : config));
      toast.success('Configuración actualizada');
      return updatedConfig;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update config';
      setError(errorMessage);
      console.error('Error updating config:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteConfig = useCallback(async (id: number) => {
    try {
      await IoTApi.deleteGlobalConfig(id);
      setConfigs(prev => prev.filter(config => config.id !== id));
      toast.success('Configuración eliminada');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete config';
      setError(errorMessage);
      console.error('Error deleting config:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return useMemo(() => ({
    configs,
    loading,
    error,
    createConfig,
    updateConfig,
    deleteConfig,
    reload: loadConfigs
  }), [configs, loading, error, createConfig, updateConfig, deleteConfig, loadConfigs]);
};