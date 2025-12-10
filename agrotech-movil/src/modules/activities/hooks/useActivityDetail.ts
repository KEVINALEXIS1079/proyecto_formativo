import { useState, useEffect, useCallback } from 'react';
import { activitiesAPI } from '../../../shared/services/api';
import { Activity } from '../types';

interface UseActivityDetailReturn {
  activity: Activity | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useActivityDetail = (activityId: number): UseActivityDetailReturn => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!activityId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await activitiesAPI.getOne(activityId);
      setActivity(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la actividad');
      console.error('Error fetching activity detail:', err);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activity,
    loading,
    error,
    refresh: fetchActivity,
  };
};
