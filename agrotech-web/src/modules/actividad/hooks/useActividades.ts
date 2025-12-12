import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listActividades,
  getActividad,
  createActividad,
  updateActividad,
  deleteActividad,
  addInsumoToActividad,
  addServicioToActividad,
  addEvidenciaToActividad,
  finalizeActividad,
} from "../api";
import type { CreateActividadPayload } from "../models/types";

export const KEYS = {
  LIST: ["actividades"],
  DETAIL: (id: number) => ["actividades", id],
};

export function useActividades(
  filters?: {
    cultivoId?: number;
    loteId?: number;
    tipo?: string;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...KEYS.LIST, filters],
    queryFn: () => listActividades(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useActividad(id: number) {
  return useQuery({
    queryKey: KEYS.DETAIL(id),
    queryFn: () => getActividad(id),
    enabled: !!id,
  });
}

export function useCreateActividad() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActividadPayload) => createActividad(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: KEYS.LIST });
    },
  });
}

export function useUpdateActividad() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateActividadPayload>;
    }) => updateActividad(id, data),
    onSuccess: (_, { id }) => {
      client.invalidateQueries({ queryKey: KEYS.LIST });
      client.invalidateQueries({ queryKey: KEYS.DETAIL(id) });
    },
  });
}

export function useDeleteActividad() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteActividad(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: KEYS.LIST });
    },
  });
}

export function useAddInsumo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { insumoId: number; cantidadUso: number; costoUnitarioUso: number };
    }) => addInsumoToActividad(id, data),
    onSuccess: (_, { id }) => {
      client.invalidateQueries({ queryKey: KEYS.DETAIL(id) });
    },
  });
}

export function useAddServicio() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { nombreServicio: string; horas: number; precioHora: number };
    }) => addServicioToActividad(id, data),
    onSuccess: (_, { id }) => {
      client.invalidateQueries({ queryKey: KEYS.DETAIL(id) });
    },
  });
}

export function useAddEvidencia() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { descripcion: string; imagenes: string[] };
    }) => addEvidenciaToActividad(id, data),
    onSuccess: (_, { id }) => {
      client.invalidateQueries({ queryKey: KEYS.DETAIL(id) });
    },
  });
}

export function useFinalizeActividad() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      finalizeActividad(id, payload),
    onSuccess: (_, { id }) => {
      client.invalidateQueries({ queryKey: KEYS.LIST });
      client.invalidateQueries({ queryKey: KEYS.DETAIL(id) });
    },
  });
}

import { useEffect } from 'react';
import { connectSocket } from '@/shared/api/client';

export function useRealTimeActividades() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectSocket('/activities');

    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: KEYS.LIST });
    };

    const handleDetailInvalidate = (data: any) => {
      queryClient.invalidateQueries({ queryKey: KEYS.LIST });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: KEYS.DETAIL(data.id) });
      }
    };

    socket.on('activities:created', handleInvalidate);
    socket.on('activities:updated', handleDetailInvalidate);
    socket.on('activities:removed', handleInvalidate);

    return () => {
      socket.off('activities:created', handleInvalidate);
      socket.off('activities:updated', handleDetailInvalidate);
      socket.off('activities:removed', handleInvalidate);
    };
  }, [queryClient]);
}
