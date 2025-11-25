export interface TipoActividad {
  id_tipo_actividad_pk: number;
  nombre_tipo_actividad: string;
  delete_at: string | null;
}

export interface Actividad {
  id_actividad_pk: number;
  nombre_actividad: string;
  descripcion_actividad: string;
  estado_actividad: string;

  tiempo_actividad: number;
  costo_mano_obra_actividad: string;

  fecha_actividad: string;
  fecha_inicio_actividad: string;
  fecha_fin_actividad: string;

  tipoActividad: TipoActividad;

  delete_at: string | null;
  usuarioActividad: any[];
  movimientos: any[];
  evidencias: any[];
  cultivosActividades: any[];
}


export interface CreateActividadDTO {
  estado_actividad: string;
  descripcion_actividad: string;
  nombre_actividad: string;
  tiempo_actividad: number;
  costo_mano_obra_actividad: number;
  fecha_actividad: string;
  fecha_inicio_actividad: string;
  fecha_fin_actividad: string;
  id_tipo_actividad_fk: number;
}
