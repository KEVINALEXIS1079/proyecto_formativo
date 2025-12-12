import api from "@/shared/api/client";
import type { Actividad, CreateActividadPayload } from "../models/types";

const BASE_URL = "/activities";

// Catalogs
export const listCultivos = async (): Promise<any[]> => {
  const { data } = await api.get("/cultivos");
  return data;
};

export const listLotes = async (): Promise<any[]> => {
  const { data } = await api.get("/geo/lotes");
  return data;
};

export const listSubLotes = async (): Promise<any[]> => {
  const { data } = await api.get("/geo/sublotes");
  return data;
};

export const listProductosAgro = async (): Promise<any[]> => {
  const { data } = await api.get("/production/productos");
  return data;
};

export const createProductoAgro = async (payload: { nombre: string; unidadMedida: string; descripcion?: string }) => {
  const { data } = await api.post("/production/productos", payload);
  return data;
};

export const listUsuarios = async (): Promise<any[]> => {
  const { data } = await api.get("/users");
  return data;
};

export const listInsumos = async (params?: { tipoInsumo?: string }): Promise<any[]> => {
  const { data } = await api.get("/insumos", { params });
  return data;
};

export const listActividades = async (params?: {
  cultivoId?: number;
  loteId?: number;
  tipo?: string;
}): Promise<Actividad[]> => {
  const { data } = await api.get(BASE_URL, { params });
  return data;
};

export const getActividad = async (id: number): Promise<Actividad> => {
  const { data } = await api.get(`${BASE_URL}/${id}`);
  return data;
};

export const createActividad = async (
  payload: CreateActividadPayload
): Promise<Actividad> => {
  const { data } = await api.post(BASE_URL, payload);
  return data;
};

export const updateActividad = async (
  id: number,
  payload: Partial<CreateActividadPayload>
): Promise<Actividad> => {
  const { data } = await api.patch(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteActividad = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

export const addInsumoToActividad = async (
  id: number,
  payload: { insumoId: number; cantidadUso: number; costoUnitarioUso: number }
) => {
  const { data } = await api.post(`${BASE_URL}/${id}/insumos`, payload);
  return data;
};

export const addServicioToActividad = async (
  id: number,
  payload: { nombreServicio: string; horas: number; precioHora: number }
) => {
  const { data } = await api.post(`${BASE_URL}/${id}/servicios`, payload);
  return data;
};

export const addEvidenciaToActividad = async (
  id: number,
  payload: { descripcion: string; imagenes: string[] }
) => {
  const { data } = await api.post(`${BASE_URL}/${id}/evidencias`, payload);
  return data;
};

export const finalizeActividad = async (
  id: number,
  payload: any // Defined in modal
) => {
  const { data } = await api.patch(`${BASE_URL}/${id}/finalize`, payload);
  return data;
};
