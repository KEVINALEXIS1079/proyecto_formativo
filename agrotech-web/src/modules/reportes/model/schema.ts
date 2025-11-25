/* zod schemas del dominio */

import { z } from "zod";

export const reporteCostosRentabilidadSchema = z.object({
  costo_insumos: z.number().min(0),
  costo_mano_obra: z.number().min(0),
  costo_maquinaria: z.number().min(0),
  ingresos_ventas: z.number().min(0),
  utilidad: z.number(),
  id_cultivo: z.number().optional(),
  id_lote: z.number().optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
});

export const reporteFiltersSchema = z.object({
  id_cultivo: z.number().optional(),
  id_lote: z.number().optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
});