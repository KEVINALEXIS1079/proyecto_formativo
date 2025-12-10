import { useState, useEffect, useCallback, useMemo } from 'react';
import { IoTApi } from '../api/iot.api';
import type { TipoSensor } from '../model/iot.types';
import { toast } from 'react-toastify';

export const useSensorTypes = () => {
  const [sensorTypes, setSensorTypes] = useState<TipoSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSensorTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IoTApi.getSensorTypes();
      setSensorTypes(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load sensor types';
      setError(errorMessage);
      console.error('Error loading sensor types:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSensorTypes();
  }, [loadSensorTypes]);

  const createSensorType = useCallback(async (payload: Partial<TipoSensor>) => {
    try {
      const newType = await IoTApi.createSensorType(payload);
      setSensorTypes(prev => [...prev, newType]);
      toast.success('Tipo de sensor creado');
      return newType;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create sensor type';
      setError(errorMessage);
      console.error('Error creating sensor type:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateSensorType = useCallback(async (id: number, payload: Partial<TipoSensor>) => {
    try {
      const updatedType = await IoTApi.updateSensorType(id, payload);
      setSensorTypes(prev => prev.map(type => type.id === id ? updatedType : type));
      toast.success('Tipo de sensor actualizado');
      return updatedType;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update sensor type';
      setError(errorMessage);
      console.error('Error updating sensor type:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteSensorType = useCallback(async (id: number) => {
    try {
      await IoTApi.deleteSensorType(id);
      setSensorTypes(prev => prev.filter(type => type.id !== id));
      toast.success('Tipo de sensor eliminado');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete sensor type';
      setError(errorMessage);
      console.error('Error deleting sensor type:', err);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return useMemo(() => ({
    sensorTypes,
    loading,
    error,
    createSensorType,
    updateSensorType,
    deleteSensorType,
    reload: loadSensorTypes
  }), [sensorTypes, loading, error, createSensorType, updateSensorType, deleteSensorType, loadSensorTypes]);
};