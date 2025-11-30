import type { Lote } from "../../cultivo/lote/model/types";
import type { Sublote } from "../../cultivo/sublote/model/types";

export type GeoLote = Lote & {
  // Add any geo-specific extra props if needed, otherwise just alias
  // But for now we want to be compatible
};

export type GeoSublote = Sublote & {
  loteNombre?: string; // We added this in the previous mapping, let's keep it if useful
};

export interface GeoMetricsData {
  countLabel: string;
  count: number;
  areaM2: number;
}
