import type { Epa, CreateEpaInput, UpdateEpaInput, TipoEpaLite, TipoCultivoEpaLite, TipoEpa, TipoCultivoEpa, CreateTipoEpaInput, UpdateTipoEpaInput, CreateTipoCultivoEpaInput, UpdateTipoCultivoEpaInput, TipoEpaEnum } from './types';

/* mappers DTO <-> tipos UI */

export const mapEpaFromBackend = (raw: any): Epa => {
  console.log("=== MAPPING EPA FROM BACKEND ===");
  console.log("Raw data:", JSON.stringify(raw, null, 2));

  const mapped = {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    sintomas: raw.sintomas,
    manejoYControl: raw.manejoYControl,
    mesesProbables: raw.mesesProbables,
    temporadas: raw.temporadas,
    notasEstacionalidad: raw.notasEstacionalidad,
    fotosSintomas: raw.fotosSintomas || [],
    fotosGenerales: raw.fotosGenerales || [],
    tags: raw.tags,
    imagenesUrls: raw.fotosGenerales || raw.fotosSintomas || [], // Usar fotosGenerales o fotosSintomas
    tipoEpa: {
      id: raw.tipoEpa?.id || 0,
      nombre: raw.tipoEpa?.nombre || raw.tipoEpa || "", // Fallback si viene como string
      descripcion: raw.tipoEpa?.descripcion || "",
      tipoEpaEnum: (raw.tipoEpa?.tipoEpaEnum || raw.tipoEpa || "enfermedad").toLowerCase() as TipoEpaEnum,
    },
    tipoCultivoEpa: {
      id: raw.epaTipoCultivos?.[0]?.tipoCultivoWiki?.id || 0,
      nombre: raw.epaTipoCultivos?.[0]?.tipoCultivoWiki?.nombre || "",
    },
    estado: raw.estado || "activo",
  };

  console.log("Mapped EPA:", JSON.stringify(mapped, null, 2));
  return mapped;
};

export const mapTipoEpaLiteFromBackend = (raw: any): TipoEpaLite => {
  return {
    id: raw.id,
    nombre: raw.nombre,
  };
};

export const mapTipoCultivoEpaLiteFromBackend = (raw: any): TipoCultivoEpaLite => {
  return {
    id: raw.id,
    nombre: raw.nombre,
  };
};

export const mapTipoEpaFromBackend = (raw: any): TipoEpa => {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    tipoEpaEnum: raw.tipoEpaEnum as TipoEpaEnum,
  };
};

export const mapTipoCultivoEpaFromBackend = (raw: any): TipoCultivoEpa => {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
  };
};

// Necesitamos acceder a los tipos EPA para mapear correctamente
// Esta función se usará desde el componente donde tenemos acceso a los tipos
export const createMapCreateEpaInputToBackend = (tiposEpa: Array<{id: number, tipoEpaEnum: string}>) => {
  return (input: CreateEpaInput): any => {
    console.log("=== MAPPER DEBUG ===");
    console.log("Input recibido:", JSON.stringify(input, null, 2));
    console.log("Tipos EPA disponibles:", tiposEpa);

    const mappedData = {
      nombre: input.nombre?.trim(),
      tipoEpa: (input.tipoEpa || 'enfermedad').toLowerCase(),
      descripcion: input.descripcion?.trim(),
      sintomas: input.sintomas?.trim(),
      manejo: input.manejoYControl?.trim(),
      mesesProbables: input.mesesProbables,
      temporadas: input.temporadas,
      fotosSintomas: [], // Por ahora vacío, se puede agregar después
      fotosGenerales: [], // Se manejará con archivos
      tags: input.tags,
      tiposCultivoIds: input.tipoCultivoEpaId ? [input.tipoCultivoEpaId] : [],
    };

    console.log("Datos mapeados para backend:", JSON.stringify(mappedData, null, 2));
    return mappedData;
  };
};

// Versión simplificada para compatibilidad - más robusta
export const mapCreateEpaInputToBackend = (input: CreateEpaInput): any => {
  console.log("=== FALLBACK MAPPER DEBUG ===");
  console.log("Input recibido:", JSON.stringify(input, null, 2));

  // Validaciones básicas
  if (!input.nombre?.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  if (!input.descripcion?.trim()) {
    throw new Error("La descripción es obligatoria");
  }

  if (!input.tipoEpa) {
    throw new Error("El tipo de EPA es obligatorio");
  }

  if (!input.tipoCultivoEpaId) {
    throw new Error("El tipo de cultivo es obligatorio");
  }

  const mappedData: any = {
    nombre: input.nombre.trim(),
    tipoEpa: 'ENFERMEDAD', // Default en mayúsculas
    descripcion: input.descripcion.trim(),
  };

  // Solo agregar campos opcionales si tienen valores
  if (input.sintomas?.trim()) {
    mappedData.sintomas = input.sintomas.trim();
  }
  if (input.manejoYControl?.trim()) {
    mappedData.manejo = input.manejoYControl.trim();
  }
  if (input.mesesProbables && input.mesesProbables.length > 0) {
    mappedData.mesesProbables = input.mesesProbables;
  }
  if (input.temporadas && input.temporadas.length > 0) {
    mappedData.temporadas = input.temporadas;
  }
  if (input.tags && input.tags.length > 0) {
    mappedData.tags = input.tags;
  }
  if (input.tipoCultivoEpaId) {
    mappedData.tiposCultivoIds = [input.tipoCultivoEpaId];
  }

  // Campos siempre presentes para archivos
  mappedData.fotosSintomas = [];
  mappedData.fotosGenerales = [];

  console.log("Datos mapeados (fallback):", JSON.stringify(mappedData, null, 2));
  return mappedData;
};

export const mapUpdateEpaInputToBackend = (input: UpdateEpaInput): any => {
  console.log("=== UPDATE EPA MAPPER DEBUG ===");
  console.log("Input received:", JSON.stringify(input, null, 2));

  const out: any = {};

  // Mapear campos con los nombres correctos que espera el backend
  if (input.nombre !== undefined) out.nombre = input.nombre;
  if (input.descripcion !== undefined) out.descripcion = input.descripcion;
  if (input.sintomas !== undefined) out.sintomas = input.sintomas;
  if (input.manejoYControl !== undefined) out.manejo = input.manejoYControl; // El backend espera 'manejo'
  if (input.mesesProbables !== undefined) out.mesesProbables = input.mesesProbables;
  if (input.temporadas !== undefined) out.temporadas = input.temporadas;
  if (input.tags !== undefined) out.tags = input.tags;

  // Para tipos EPA y cultivo, ahora se envían desde el formulario de edición
  if (input.tipoEpa !== undefined) out.tipoEpa = input.tipoEpa;
  if (input.tipoCultivoEpaId !== undefined) out.tipoCultivoEpaId = input.tipoCultivoEpaId;

  console.log("Mapped output:", JSON.stringify(out, null, 2));
  return out;
};

export const mapCreateTipoEpaInputToBackend = (input: CreateTipoEpaInput): any => {
  return {
    nombre: input.nombre,
    descripcion: input.descripcion,
    tipoEpaEnum: input.tipoEpaEnum,
  };
};

export const mapUpdateTipoEpaInputToBackend = (input: UpdateTipoEpaInput): any => {
  const out: any = {};
  if (input.nombre !== undefined) out.nombre = input.nombre;
  if (input.descripcion !== undefined) out.descripcion = input.descripcion;
  if (input.tipoEpaEnum !== undefined) out.tipoEpaEnum = input.tipoEpaEnum;
  return out;
};

export const mapCreateTipoCultivoEpaInputToBackend = (input: CreateTipoCultivoEpaInput): any => {
  return {
    nombre: input.nombre?.trim(),
    descripcion: input.descripcion?.trim(),
  };
};

export const mapUpdateTipoCultivoEpaInputToBackend = (input: UpdateTipoCultivoEpaInput): any => {
  const out: any = {};
  if (input.nombre !== undefined) out.nombre = input.nombre.trim();
  if (input.descripcion !== undefined) out.descripcion = input.descripcion.trim();
  return out;
};