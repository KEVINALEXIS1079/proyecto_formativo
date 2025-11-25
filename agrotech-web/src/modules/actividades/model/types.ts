import type { Lote, Sublote, Cultivo } from '../../cultivos/model/types';

export interface TipoActividad {
  id: number;
  nombre: string;
}

export interface CreateTipoActividadInput {
  nombre: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  cedula: string;
  apellido: string;
  telefono: string;
  correo: string;
  idFicha: string;
  // Agregar otros campos si necesario
}

export interface Insumo {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria?: { id: number; nombre: string };
  unidadBase?: string;
  stockTotalBase?: number;
  precioUnitario?: number;
  // Agregar otros campos si necesario
}

export interface Evidencia {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  observacion: string;
  fechaInicio?: string;
  fechaFin?: string;
  imgUrl?: string;
}

export interface ActividadParticipante {
  id: number;
  rol?: string;
  observaciones?: string;
  usuario: Usuario;
}

export interface ActividadInsumo {
  id: number;
  cantidadUsada: number;
  unidadMedida?: string;
  observaciones?: string;
  insumo: Insumo;
}

export interface Actividad {
  id: number;
  descripcion: string;
  nombre: string;
  costoManoObra: number;
  fecha: string;
  fechaInicio: string;
  fechaFin: string;
  tipoActividad: TipoActividad;
  lote?: Lote;
  sublote?: Sublote;
  cultivo?: Cultivo;
  subtipos?: ActividadSubtipo[];
  participantes: ActividadParticipante[];
  insumos: ActividadInsumo[];
  evidencias: Evidencia[];
}

export interface CreateActividadInput {
   descripcion_actividad: string;
   nombre_actividad: string;
   costo_mano_obra_actividad: number;
   fecha_actividad: string;
   fecha_inicio_actividad: string;
   fecha_fin_actividad: string;
   tipo_actividad: string;
   estado_actividad: string;
   id_tipo_actividad_fk: number;
   subtipo?: string;
   subtipos?: CreateSubtipoInput[];
   id_lote_fk?: number;
   id_sublote_fk?: number;
   id_cultivo_fk?: number;
   participantes?: CreateParticipanteInput[];
   insumos?: CreateInsumoInput[];
   servicios?: CreateServicioInput[];
   evidencias?: CreateEvidenciaInput[];
 }

export interface CreateParticipanteInput {
  id_usuario_fk: number;
  horas_trabajadas: number;
  rol_participante?: string;
  observaciones_participante?: string;
}

export interface CreateInsumoInput {
  id_insumo_fk: number;
  cantidad_usada: number;
  unidad_medida?: string;
  observaciones?: string;
}

export interface CreateServicioInput {
  id_servicio_fk: number;
  horas_usadas: number;
  observaciones?: string;
}

export interface CreateEvidenciaInput {
  nombre_evidencia: string;
  descripcion_evidencia: string;
  fecha_evidencia: string;
  observacion_evidencia: string;
  fecha_inicio_evidencia?: string;
  fecha_fin_evidencia?: string;
  img_evidencia?: string;
}

export interface CreateSubtipoInput {
  id_subtipo_fk?: number;
  nombre_subtipo?: string;
  descripcion_subtipo?: string;
}

export interface UpdateActividadInput extends Partial<CreateActividadInput> {}

export interface ActividadSubtipo {
  id: number;
  nombre: string;
  descripcion?: string;
  tipoActividad: TipoActividad;
}

export interface CreateActividadSubtipoInput {
  nombre: string;
  idTipoActividad: number;
}

export interface UpdateActividadSubtipoInput extends Partial<CreateActividadSubtipoInput> {}