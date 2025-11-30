import { loteService } from "../../cultivo/lote/api/lotes.service";
import { mapSubloteFromApi } from "../../cultivo/sublote/model/mappers";
import type { GeoLote } from "../models/types";

export const geoService = {
  async getLotes(): Promise<GeoLote[]> {
    const data = await loteService.listLotes();
    console.log("📍 Lotes from backend:", data.length, "lotes");
    
    // Map sublotes for each lote
    return data.map(lote => {
      const mappedSublotes = Array.isArray(lote.sublotes) 
        ? lote.sublotes.map(mapSubloteFromApi) 
        : [];
      
      console.log(`📍 Lote:`, lote.nombre_lote, "- Sublotes:", mappedSublotes.length);
      
      return {
        ...lote,
        sublotes: mappedSublotes.map(s => ({
            ...s,
            loteNombre: lote.nombre_lote
        }))
      };
    });
  }
};
