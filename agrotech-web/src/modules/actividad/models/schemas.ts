import { z } from "zod";

// Base Schema for creating/editing Activity
export const actividadSchema = z.object({
  nombre: z.string().min(5, "El nombre debe tener al menos 5 caracteres").nonempty("El nombre es requerido"),
  tipo: z.string().nonempty("El tipo de actividad es requerido"),
  subtipo: z.string().nonempty("El subtipo es requerido"),
  fecha: z.date(),
  descripcion: z.string().optional(),

  // Locations (Lote ID is mandatory, others optional but dependent)
  loteId: z.coerce.number().min(1, "Debe seleccionar un lote"),
  subLoteId: z.coerce.number().optional(), // Removed nullable
  cultivoId: z.coerce.number().min(1, "El cultivo es requerido"),

  // Status to explicit toggle
  estado: z.enum(["PENDIENTE", "FINALIZADA"]).optional().default("PENDIENTE"),

  // Details
  horasActividad: z.coerce.number().min(0, "Las horas no pueden ser negativas"),
  precioHoraActividad: z.coerce.number().min(0, "El precio por hora no puede ser negativo"),

  // Harvest specifics (Validated only if subtipo is COSECHA in frontend logic or refinements)
  cantidadPlantas: z.coerce.number().optional(),
  kgRecolectados: z.coerce.number().optional(),

  // Arrays
  responsables: z.array(z.object({
    usuarioId: z.number(),
    horas: z.number().min(0),
    precioHora: z.number().min(0),
    // Frontend helper for UI
    tempId: z.string().optional(),
  })).optional(),

  insumos: z.array(z.object({
    insumoId: z.number(),
    cantidadUso: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
    costoUnitarioUso: z.number().min(0).default(0),
    descripcion: z.string().optional(),
    tempId: z.string().optional(),
  })).optional(),

  servicios: z.array(z.object({
    nombreServicio: z.string().nonempty(),
    horas: z.number().min(0),
    precioHora: z.number().min(0),
    tempId: z.string().optional(),
  })).optional(),

  evidencias: z.array(z.object({
    descripcion: z.string().nonempty(),
    imagenes: z.array(z.string()),
  })).optional(),

  herramientas: z.array(z.object({
    activoFijoId: z.number(),
    horasUso: z.number().min(0),
    tempId: z.string().optional(),
  })).optional(),
});

// Finalization Schema
export const finalizarActividadSchema = z.object({
  fechaReal: z.date(),

  // Confirmation of resources
  insumosReales: z.array(z.object({
    insumoId: z.number(),
    cantidad: z.coerce.number().min(0, "La cantidad no puede ser negativa"),
  })),

  // Harvest data (Conditional validation logic usually handled in resolver or refinements)
  produccion: z.object({
    cantidad: z.coerce.number().min(0),
    unidad: z.string().default("Kg"),
  }).optional(),
});

export type ActividadFormData = z.infer<typeof actividadSchema>;
export type FinalizarActividadData = z.infer<typeof finalizarActividadSchema>;
