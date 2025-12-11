import { lotesService } from "../../cultivos/api/lotes.service";
import type { GeoLote } from "../models/types";

export const geoService = {
  async getLotes(): Promise<GeoLote[]> {
    const data = await lotesService.list();
    console.log("📍 Lotes from backend:", data.length, "lotes");

    // Map sublotes for each lote (already adapted by lotesService)
    return data.map(lote => {
      const existingSublotes = Array.isArray(lote.sublotes) ? lote.sublotes : [];

      return {
        ...lote,
        sublotes: existingSublotes.map(s => ({
          ...s,
          loteNombre: lote.nombre_lote
        }))
      };
    });
  }
};
