import type {
  Actividad,
  ActividadParticipante,
  ActividadInsumo,
  ActividadSubtipo,
  Evidencia,
  TipoActividad,
  Usuario,
  Insumo,
} from './types';
import { adaptLote, adaptSublote, adaptCultivo } from '../../cultivos/model/mappers';

export function adaptTipoActividad(raw: any): TipoActividad {
  return {
    id: raw.id_tipo_actividad_pk,
    nombre: raw.nombre_tipo_actividad,
  };
}

export function adaptUsuario(raw: any): Usuario {
  return {
    id: raw.id_usuario_pk,
    cedula: raw.cedula_usuario || raw.cedula || '',
    nombre: raw.nombre_usuario || raw.nombre || '',
    apellido: raw.apellido_usuario || raw.apellido || '',
    telefono: raw.telefono_usuario || raw.telefono || '',
    correo: raw.correo_usuario || raw.correo || raw.email || '',
    idFicha: raw.id_ficha || raw.idFicha || '',
  };
}

export function adaptInsumo(raw: any): Insumo {
  return {
    id: raw.id_insumo_pk,
    nombre: raw.nombre_insumo,
    descripcion: raw.descripcion || '',
    categoria: raw.categoria ? { id: raw.categoria.id_categoria_insumo_pk, nombre: raw.categoria.nombre_categoria_insumo } : undefined,
  };
}

export function adaptEvidencia(raw: any): Evidencia {
  return {
    id: raw.id_evidencia_pk,
    nombre: raw.nombre_evidencia,
    descripcion: raw.descripcion_evidencia,
    fecha: raw.fecha_evidencia,
    observacion: raw.observacion_evidencia,
    fechaInicio: raw.fecha_inicio_evidencia,
    fechaFin: raw.fecha_fin_evidencia,
    imgUrl: raw.img_evidencia,
  };
}

export function adaptActividadParticipante(raw: any): ActividadParticipante {
  return {
    id: raw.id_participante_pk,
    rol: raw.rol_participante,
    observaciones: raw.observaciones_participante,
    usuario: adaptUsuario(raw.usuario),
  };
}

export function adaptActividadInsumo(raw: any): ActividadInsumo {
  return {
    id: raw.id_actividad_insumo_pk,
    cantidadUsada: raw.cantidad_usada,
    unidadMedida: raw.unidad_medida,
    observaciones: raw.observaciones,
    insumo: adaptInsumo(raw.insumo),
  };
}

export function adaptActividad(raw: any): Actividad {
  return {
    id: raw.id_actividad_pk,
    descripcion: raw.descripcion_actividad,
    nombre: raw.nombre_actividad,
    costoManoObra: raw.costo_mano_obra_actividad,
    fecha: raw.fecha_actividad,
    fechaInicio: raw.fecha_inicio_actividad,
    fechaFin: raw.fecha_fin_actividad,
    tipoActividad: adaptTipoActividad(raw.tipoActividad),
    lote: raw.lote ? adaptLote(raw.lote) : undefined,
    sublote: raw.sublote ? adaptSublote(raw.sublote) : undefined,
    cultivo: raw.cultivo ? adaptCultivo(raw.cultivo) : undefined,
    subtipos: raw.subtipos ? raw.subtipos.map(adaptActividadSubtipo) : [],
    participantes: raw.participantes ? raw.participantes.map(adaptActividadParticipante) : [],
    insumos: raw.insumos ? raw.insumos.map(adaptActividadInsumo) : [],
    evidencias: raw.evidencias ? raw.evidencias.map(adaptEvidencia) : [],
  };
}

export function adaptActividadSubtipo(raw: any): ActividadSubtipo {
  return {
    id: raw.id_subtipo_pk,
    nombre: raw.nombre_subtipo,
    descripcion: raw.descripcion_subtipo,
    tipoActividad: adaptTipoActividad(raw.tipoActividad),
  };
}