// src/modules/iot/Sensor/hooks/useSensores.ts
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sensorService, socketSensores } from "../api/sensor.service";
import { catalogService } from "../api/catalogoService";
import type {
  CreateSensorInput,
  UpdateSensorInput,
  Sensor,
  TipoSensorLite,
  LoteLite,
  SensorLectura,
} from "../model/types";

export const qk = {
  list: () => ["sensores", "list"] as const,
  deleted: () => ["sensores", "deleted"] as const,
  byId: (id?: number) => ["sensores", "byId", id] as const,
  historial: (id?: number) => ["sensores", "historial", id] as const,
  tipos: () => ["catalogos", "tipo-sensor"] as const,
  lotes: () => ["catalogos", "lotes"] as const,
};

// Catálogos
export function useTiposSensor() {
  return useQuery<TipoSensorLite[]>({ queryKey: qk.tipos(), queryFn: catalogService.tipos });
}
export function useLotes() {
  return useQuery<LoteLite[]>({ queryKey: qk.lotes(), queryFn: catalogService.lotes });
}

// Datos
export function useSensoresList() {
  return useQuery<Sensor[]>({ queryKey: qk.list(), queryFn: sensorService.list });
}
export function useSensoresDeleted() {
  return useQuery<Sensor[]>({ queryKey: qk.deleted(), queryFn: sensorService.listDeleted });
}
export function useSensor(id?: number) {
  return useQuery<Sensor | null>({
    queryKey: qk.byId(id),
    queryFn: () => (id ? sensorService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

// Historial (REST)
export function useSensorHistorial(id?: number) {
  return useQuery<SensorLectura[]>({
    queryKey: qk.historial(id),
    queryFn: () => (id ? sensorService.historial(id) : Promise.resolve([])),
    enabled: !!id,
    staleTime: 15_000,
  });
}

// Mutations
export function useCreateSensor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSensorInput) => sensorService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.list() });
    },
  });
}
export function useUpdateSensor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: number; input: UpdateSensorInput }) => sensorService.update(p.id, p.input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: qk.list() });
      qc.invalidateQueries({ queryKey: qk.byId(id) });
    },
  });
}
export function useRemoveSensor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sensorService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.list() });
      qc.invalidateQueries({ queryKey: qk.deleted() });
    },
  });
}
export function useRestoreSensor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sensorService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.list() });
      qc.invalidateQueries({ queryKey: qk.deleted() });
    },
  });
}

// Realtime (WS) – invalida listas al recibir eventos
export function useSensorRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const s = socketSensores();
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: qk.list() });
      qc.invalidateQueries({ queryKey: qk.deleted() });
    };
    s.on("sensores:created", invalidate);
    s.on("sensores:updated", invalidate);
    s.on("sensores:removed", invalidate);
    s.on("sensores:restored", invalidate);
    return () => {
      s.off("sensores:created", invalidate);
      s.off("sensores:updated", invalidate);
      s.off("sensores:removed", invalidate);
      s.off("sensores:restored", invalidate);
    };
  }, [qc]);
}
