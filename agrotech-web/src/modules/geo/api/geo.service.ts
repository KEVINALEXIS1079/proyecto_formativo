import { lotesService } from "../../cultivos/api/lotes.service";
import type { GeoLote } from "../models/types";

export const geoService = {
  async getLotes(filters?: { estado?: string }): Promise<GeoLote[]> {
    // lotesService.list passes params as query to /geo/lotes
    // Our backend now accepts 'estado'
    const params: any = {};
    if (filters?.estado && filters.estado !== 'all') {
      params.estado = filters.estado;
    }
    
    // We need to cast because lotesService.list expects specific params structure
    // but the underlying api call allows any params.
    // However, lotesService.list signature is strict. 
    // Let's bypass slightly or use the 'q' param if needed, but 'estado' is separate.
    // Actually, lotesService.list creates 'query' object from params. 
    // If I want to pass 'estado', I might need to extend lotesService OR call api directly.
    // Let's try calling lotesService.list and see if we can trick it or if we need to use direct API.
    // Since lotesService is strict, let's use direct API here for full control over new filters
    // without breaking existing lotesService consumers.
    
    // Wait, reusing lotesService is better for DRY. 
    // Let's see if we can modify lotesService later. For now, let's just use the `api` client directly 
    // to ensure we send 'estado'.
    
    // To do that we need to import 'api'.
    // import { api } from "@/shared/api/client"; 
    // But I don't want to change imports too much if I can avoid it.
    
    // Actually, looking at lotesService (Step 97), it takes { page, limit, q }.
    // It doesn't take 'estado'.
    
    // So I should probably just implement the call directly here in geo.service.ts 
    // mirroring what lotesService does but with my extra param.
    // OR better, I should use `lotesService` methods for UPDATE, but for LIST I might need my own if I can't extend it.
    
    // Let's try to stick to importing `lotesService` for updates, but for listing let's allow passing custom params 
    // by modifying this file to import `api` from shared.
    
    // Re-reading Step 97: `lotesService` methods: `updateLote`, `updateSubLote` EXIST.
    // So I can just expose them in `geoService`.
    
    return this.fetchLotes(filters);
  },

  async fetchLotes(filters?: { estado?: string }): Promise<GeoLote[]> {
     // Dynamic import to avoid circular dependency issues if any, or just standard import
     const { api } = await import("@/shared/api/client");
     const { adaptLote } = await import("../../cultivos/model/mappers");
     
     const params: any = {};
     if (filters?.estado && filters.estado !== 'all') {
       params.estado = filters.estado;
     }

     const { data } = await api.get("/geo/lotes", { params });
     
     const rawLotes = (Array.isArray(data) ? data : []) as any[];
     const adaptedLotes = rawLotes.map(adaptLote);

     return adaptedLotes.map(lote => {
      const existingSublotes = Array.isArray(lote.sublotes) ? lote.sublotes : [];
      return {
        ...lote,
        sublotes: existingSublotes.map(s => ({
          ...s,
          loteNombre: lote.nombre_lote
        }))
      };
    });
  },

  async updateLote(id: number, data: any) {
    return lotesService.updateLote(id, data);
  },

  async updateSubLote(id: number, data: any) {
    return lotesService.updateSublote(id, data);
  }
};
