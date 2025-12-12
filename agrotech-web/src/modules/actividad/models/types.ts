export interface TipoActividad {
  id_tipo_actividad_pk: number;
  nombre_tipo_actividad: string;
  delete_at: string | null;
}

export interface ActividadResponsable {
  id: number;
  actividadId: number;
  usuarioId: number;
  horas: number;
  precioHora: number;
  costo: number;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface ActividadInsumoUso {
  id: number;
  actividadId: number;
  insumoId: number;
  cantidadUso: number;
  costoUnitarioUso: number;
  costoTotal: number;
  insumo?: {
    id: number;
    nombre: string;
    unidad: string;
  };
}

export interface ActividadServicio {
  id: number;
  actividadId: number;
  nombreServicio: string;
  horas: number;
  precioHora: number;
  costo: number;
}

export interface ActividadEvidencia {
  id: number;
  actividadId: number;
  descripcion: string;
  imagenes: string[];
}

export interface ActividadInsumoReserva {
  id: number;
  actividadId: number;
  insumoId: number;
  cantidadReservada: number;
  insumo?: {
    id: number;
    nombre: string;
    unidadUso: string;
  };
}

export interface ActividadHerramientaUso {
  id: number;
  actividadId: number;
  insumoId: number;
  horasUsadas: number;
  depreciacionGenerada: number;
  fechaUso?: string;
  insumo?: {
    id: number;
    nombre: string;
    unidadUso?: string;
    tipoInsumo?: string;
    costoAdquisicion?: number;
  };
}

export interface Actividad {
  id: number; // Backend uses 'id', not 'id_actividad_pk' in new entities usually, but let's check legacy.
  // The legacy code used id_actividad_pk. The new backend entity uses BaseEntity which has 'id'.
  // I will support both for now or switch to 'id' if I can confirm.
  // Looking at the controller, it returns the entity. BaseEntity usually has 'id'.
  // I will use 'id' as primary, but keep mapped types if needed.
  // Actually, let's stick to the backend entity structure I saw:
  // id, nombre, tipo, subtipo, fecha, ...

  // id: number; // Removed duplicate
  nombre: string;
  tipo: string;
  subtipo: string;
  descripcion?: string;

  fecha: string; // ISO Date

  cultivoId: number;
  loteId?: number;
  subLoteId?: number;

  horasActividad: number;
  precioHoraActividad: number;
  costoManoObra: number;

  creadoPorUsuarioId: number;

  responsables?: ActividadResponsable[];
  insumosUso?: ActividadInsumoUso[];
  insumosReserva?: ActividadInsumoReserva[];
  servicios?: ActividadServicio[];

  evidencias?: ActividadEvidencia[];
  herramientas?: {
    // Definición de herramienta/activo planificado (ActividadHerramienta)
    id: number;
    actividadId: number;
    activoFijoId: number;
    horasEstimadas: number;
    activoFijo?: {
      id: number;
      nombre: string;
    };
  }[];
  usosHerramientas?: ActividadHerramientaUso[];

  // Legacy/Mapped fields for compatibility if needed (but I prefer clean new ones)
  // estado_actividad? : string; // The backend entity doesn't seem to have 'estado' column explicitly in the file I read?
  // Wait, I checked `actividad.entity.ts` and it has: nombre, tipo, subtipo, loteId, subLoteId, cultivoId, fecha, horasActividad...
  // It does NOT have 'estado'.
  // RF13 says: "Setear Cultivo.estado".
  // RF15 says: "estado inicial = 'activo' (o 'en_proceso')".
  // But the entity file I read (Step 37) DOES NOT have an 'estado' column.
  // It might be missing or I missed it.
  // Let me re-read Step 37.
  // Lines 12-82. No 'estado' column.
  // However, `CreateActivityDto` doesn't have it either.
  // Maybe it's inferred or I should add it?
  // The requirements mention "estado inicial".
  // I will stick to what is in the backend entity for now.
  // Extended properties for UI
  estado?: string;
  costoTotal?: number;
  lote?: {
    id: number;
    nombre: string;
    cultivos?: any[]; // For inferred crop display
  };
  subLote?: {
    id: number;
    nombre: string;
  };
  cultivo?: {
    id: number;
    nombre: string;
    nombreCultivo?: string; // Correct property from Backend Entity
  };
  creadoPorUsuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface CreateActivityResponsablePayload {
  usuarioId: number;
  horas?: number;
  precioHora?: number;
}

export interface CreateActividadPayload {
  nombre: string;
  tipo: string;
  subtipo: string;
  cultivoId: number;
  loteId?: number;
  subLoteId?: number;
  fecha: string;
  descripcion?: string;
  estado?: string; // 'Pendiente' | 'Finalizada'
  horasActividad?: number;
  precioHoraActividad?: number;
  kgRecolectados?: number; // Para Cosecha
  cantidadPlantas?: number; // Para Cosecha
  productoAgroId?: number; // Para Cosecha
  fechaSiembra?: string; // Para Siembra
  responsables?: CreateActivityResponsablePayload[];
  insumos?: CreateActivityInsumoPayload[];
  servicios?: CreateActivityServicioPayload[];
  evidencias?: CreateActivityEvidenciaPayload[];
  herramientas?: CreateActivityHerramientaPayload[];
}

export interface CreateActivityHerramientaPayload {
  activoFijoId: number;
  horasUso: number;
}

export interface CreateActivityInsumoPayload {
  insumoId: number;
  cantidadUso: number;
  costoUnitarioUso: number;
  descripcion?: string;
}

export interface CreateActivityServicioPayload {
  nombreServicio: string;
  horas: number;
  precioHora: number;
}

export interface CreateActivityEvidenciaPayload {
  descripcion: string;
  imagenes: string[];
}
