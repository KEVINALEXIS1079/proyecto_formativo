// src/modules/actividades/api/servicios.service.ts
import { api } from "@/shared/api/client";

/* =========================
 * Tipos del dominio
 * ========================= */
export type ServicioLite = {
  id: number;
  nombre: string;
  tipo: string;
  estado?: string;
  costo_por_hora?: number;
};

/* =========================
 * Helpers de mapeo
 * ========================= */
function adaptServicioLite(x: any): ServicioLite {
  return {
    id: x?.id_servicio_pk ?? x?.id ?? 0,
    nombre: x?.nombre ?? "",
    tipo: x?.tipo ?? "",
    estado: x?.estado ?? "",
    costo_por_hora: x?.costo_por_hora ?? 0,
  };
}

function normalizeListResp(data: any): ServicioLite[] {
  const raw =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.servicios) && data.servicios) ||
    [];
  return (raw as any[]).map(adaptServicioLite);
}

/* =========================
 * Service
 * ========================= */
class ServiciosService {
  async list(params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<ServicioLite[]> {
    const query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.q) {
      query.q = params.q;
      query.search = params.q;
    }

    const { data } = await api.get("/servicios", { params: query });
    return normalizeListResp(data);
  }
}

export const serviciosService = new ServiciosService();

/* =========================
 * Exports de función (para hooks)
 * ========================= */
export const listServicios = (params?: {
  page?: number;
  limit?: number;
  q?: string;
}) => serviciosService.list(params);