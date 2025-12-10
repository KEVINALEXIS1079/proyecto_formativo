import { useState, useEffect, useCallback } from 'react';
import { activitiesAPI } from '../../../shared/services/api';
import { Activity, ActivityFilters } from '../types';

interface UseActivitiesReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  filters: ActivityFilters;
  setFilters: (filters: ActivityFilters) => void;
  refresh: () => Promise<void>;
  filteredActivities: Activity[];
}

export const useActivities = (): UseActivitiesReturn => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({});

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activitiesAPI.getAll();
      setActivities(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar actividades');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = activities.filter(activity => {
    // Filter by status
    if (filters.estado && activity.estado !== filters.estado) {
      return false;
    }

    // Filter by type
    if (filters.tipo && activity.tipo !== filters.tipo) {
      return false;
    }

    // Filter by subtype
    if (filters.subtipo && activity.subtipo !== filters.subtipo) {
      return false;
    }

    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchesName = activity.nombre.toLowerCase().includes(query);
      const matchesDescription = activity.descripcion?.toLowerCase().includes(query);
      const matchesType = activity.tipo.toLowerCase().includes(query);
      const matchesSubtype = activity.subtipo.toLowerCase().includes(query);

      if (!matchesName && !matchesDescription && !matchesType && !matchesSubtype) {
        return false;
      }
    }

    // Filter by date range
    if (filters.fechaInicio || filters.fechaFin) {
      const activityDate = new Date(activity.fecha);
      if (filters.fechaInicio) {
        const startDate = new Date(filters.fechaInicio);
        if (activityDate < startDate) return false;
      }
      if (filters.fechaFin) {
        const endDate = new Date(filters.fechaFin);
        if (activityDate > endDate) return false;
      }
    }

    return true;
  });

  return {
    activities,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchActivities,
    filteredActivities,
  };
};
