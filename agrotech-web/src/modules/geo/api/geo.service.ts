import { lotesService } from "../../cultivos/api/lotes.service";
import { adaptSublote } from "../../cultivos/model/mappers";
import type { GeoLote } from "../models/types";

export const geoService = {
  async getLotes(): Promise<GeoLote[]> {
    const data = await lotesService.list();
    console.log("📍 Lotes from backend:", data.length, "lotes");

    // Map sublotes for each lote
    return data.map(lote => {
      const mappedSublotes = Array.isArray(lote.sublotes)
        ? lote.sublotes.map(adaptSublote)
        : [];

      // console.log(`📍 Lote:`, lote.nombre_lote, "- Sublotes:", mappedSublotes.length);

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
