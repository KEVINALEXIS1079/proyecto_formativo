import type { Epa, CreateEpaInput, UpdateEpaInput, TipoEpaLite, TipoCultivoEpaLite, TipoEpa, TipoCultivoEpa, CreateTipoEpaInput, UpdateTipoEpaInput, CreateTipoCultivoEpaInput, UpdateTipoCultivoEpaInput } from './types';

/* mappers DTO <-> tipos UI */

export const mapEpaFromBackend = (raw: any): Epa => {
  return {
    id: raw.id_epa_pk,
    nombre: raw.nombre_epa,
    descripcion: raw.descripcion_epa,
    sintomas: raw.sintomas,
    manejoYControl: raw.manejo_y_control || raw.manejo_control, // Fallback
    mesesProbables: raw.meses_probables,
    temporadas: raw.temporadas,
    notasEstacionalidad: raw.notas_estacionalidad,
    fotosSintomas: raw.fotos_sintomas,
    fotosGenerales: raw.fotos_generales,
    tags: raw.tags,
    imagenesUrls: raw.imagenes_urls || raw.fotos_generales, // Fallback
    tipoEpa: {
      id: raw.tipoEpa?.id_tipo_epa_pk ?? 0,
      nombre: raw.tipoEpa?.nombre_tipo_epa ?? raw.tipo_epa, // Fallback si viene como string
    },
    tipoCultivoEpa: {
      id: raw.tipoCultivoEpa?.id_tipo_cultivo_epa_pk ?? 0,
      nombre: raw.tipoCultivoEpa?.nombre_tipo_cultivo_epa ?? "",
    },
    estado: raw.estado,
  };
};

export const mapTipoEpaLiteFromBackend = (raw: any): TipoEpaLite => {
  return {
    id: raw.id_tipo_epa_pk,
    nombre: raw.nombre_tipo_epa,
  };
};

export const mapTipoCultivoEpaLiteFromBackend = (raw: any): TipoCultivoEpaLite => {
  return {
    id: raw.id_tipo_cultivo_epa_pk,
    nombre: raw.nombre_tipo_cultivo_epa,
  };
};

export const mapTipoEpaFromBackend = (raw: any): TipoEpa => {
  return {
    id: raw.id_tipo_epa_pk,
    nombre: raw.nombre_tipo_epa,
    descripcion: raw.descripcion,
    tipoEpaEnum: raw.tipo_epa_enum,
  };
};

export const mapTipoCultivoEpaFromBackend = (raw: any): TipoCultivoEpa => {
  return {
    id: raw.id_tipo_cultivo_epa_pk,
    nombre: raw.nombre_tipo_cultivo_epa,
    descripcion: raw.descripcion,
  };
};

export const mapCreateEpaInputToBackend = (input: CreateEpaInput): any => {
  return {
    nombre_epa: input.nombre,
    descripcion_epa: input.descripcion,
    estado: input.estado,
    id_tipo_epa_fk: input.tipoEpaId,
    id_tipo_cultivo_epa_fk: input.tipoCultivoEpaId,
    id_cultivo_fk: input.cultivoId,
    sintomas: input.sintomas,
    manejo_y_control: input.manejoYControl,
    meses_probables: input.mesesProbables,
    temporadas: input.temporadas,
    notas_estacionalidad: input.notasEstacionalidad,
    tags: input.tags,
    // imagenes_urls: input.imagenesUrls, // Se maneja via fotos_generales usualmente
  };
};

export const mapUpdateEpaInputToBackend = (input: UpdateEpaInput): any => {
  const out: any = {};
  if (input.nombre !== undefined) out.nombre_epa = input.nombre;
  if (input.descripcion !== undefined) out.descripcion_epa = input.descripcion;
  if (input.estado !== undefined) out.estado = input.estado;
  if (input.tipoEpaId !== undefined) out.id_tipo_epa_fk = input.tipoEpaId;
  if (input.tipoCultivoEpaId !== undefined) out.id_tipo_cultivo_epa_fk = input.tipoCultivoEpaId;
  if (input.cultivoId !== undefined) out.id_cultivo_fk = input.cultivoId;
  if (input.sintomas !== undefined) out.sintomas = input.sintomas;
  if (input.manejoYControl !== undefined) out.manejo_y_control = input.manejoYControl;
  if (input.mesesProbables !== undefined) out.meses_probables = input.mesesProbables;
  if (input.temporadas !== undefined) out.temporadas = input.temporadas;
  if (input.notasEstacionalidad !== undefined) out.notas_estacionalidad = input.notasEstacionalidad;
  if (input.tags !== undefined) out.tags = input.tags;
  return out;
};

export const mapCreateTipoEpaInputToBackend = (input: CreateTipoEpaInput): any => {
  return {
    nombre_tipo_epa: input.nombre,
    descripcion: input.descripcion,
    tipo_epa_enum: input.tipoEpaEnum,
  };
};

export const mapUpdateTipoEpaInputToBackend = (input: UpdateTipoEpaInput): any => {
  const out: any = {};
  if (input.nombre !== undefined) out.nombre_tipo_epa = input.nombre;
  if (input.descripcion !== undefined) out.descripcion = input.descripcion;
  if (input.tipoEpaEnum !== undefined) out.tipo_epa_enum = input.tipoEpaEnum;
  return out;
};

export const mapCreateTipoCultivoEpaInputToBackend = (input: CreateTipoCultivoEpaInput): any => {
  return {
    nombre_tipo_cultivo_epa: input.nombre,
    descripcion: input.descripcion,
  };
};

export const mapUpdateTipoCultivoEpaInputToBackend = (input: UpdateTipoCultivoEpaInput): any => {
  const out: any = {};
  if (input.nombre !== undefined) out.nombre_tipo_cultivo_epa = input.nombre;
  if (input.descripcion !== undefined) out.descripcion = input.descripcion;
  return out;
};