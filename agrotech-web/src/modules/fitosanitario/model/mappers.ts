import type { Epa, CreateEpaInput, UpdateEpaInput, TipoEpaLite, TipoCultivoEpaLite, TipoEpa, TipoCultivoEpa, CreateTipoEpaInput, UpdateTipoEpaInput, CreateTipoCultivoEpaInput, UpdateTipoCultivoEpaInput } from './types';

/* mappers DTO <-> tipos UI */

export const mapEpaFromBackend = (raw: any): Epa => {
  return {
    id: raw.id_epa_pk,
    nombre: raw.nombre_epa,
    descripcion: raw.descripcion_epa,
    sintomas: raw.sintomas,
    manejoControl: raw.manejo_control,
    mesesRiesgo: raw.meses_riesgo,
    temporadaText: raw.temporada_text,
    imagenesUrls: raw.imagenes_urls,
    tipoEpa: {
      id: raw.tipoEpa.id_tipo_epa_pk,
      nombre: raw.tipoEpa.nombre_tipo_epa,
    },
    tipoCultivoEpa: {
      id: raw.tipoCultivoEpa.id_tipo_cultivo_epa_pk,
      nombre: raw.tipoCultivoEpa.nombre_tipo_cultivo_epa,
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
    manejo_control: input.manejoControl,
    meses_riesgo: input.mesesRiesgo,
    temporada_text: input.temporadaText,
    imagenes_urls: input.imagenesUrls,
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
  if (input.manejoControl !== undefined) out.manejo_control = input.manejoControl;
  if (input.mesesRiesgo !== undefined) out.meses_riesgo = input.mesesRiesgo;
  if (input.temporadaText !== undefined) out.temporada_text = input.temporadaText;
  if (input.imagenesUrls !== undefined) out.imagenes_urls = input.imagenesUrls;
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