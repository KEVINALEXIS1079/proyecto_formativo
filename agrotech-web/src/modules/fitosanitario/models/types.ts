export type EstadoEpa = "presente" | "ausente";

export type TipoEpaEnum = "enfermedad" | "plaga" | "arvense";

export type TipoEpaLite = {
  id: number;
  nombre: string;
};

export type TipoEpa = {
  id: number;
  nombre: string;
  descripcion: string;
  tipoEpaEnum: TipoEpaEnum;
};

export type TipoCultivoEpaLite = {
  id: number;
  nombre: string;
};

export type TipoCultivoEpa = {
  id: number;
  nombre: string;
  descripcion?: string;
};

export type CreateTipoEpaInput = {
  nombre: string;
  descripcion: string;
  tipoEpaEnum: TipoEpaEnum;
};

export type UpdateTipoEpaInput = Partial<CreateTipoEpaInput>;

export type CreateTipoCultivoEpaInput = {
  nombre: string;
  descripcion?: string;
};

export type UpdateTipoCultivoEpaInput = Partial<CreateTipoCultivoEpaInput>;

export type Epa = {
  id: number;
  nombre: string;
  descripcion: string;
  sintomas?: string;
  manejoYControl?: string;
  mesesProbables?: number[];
  temporadas?: string[];
  notasEstacionalidad?: string;
  fotosSintomas?: string[];
  fotosGenerales?: string[];
  tags?: string[];
  imagenesUrls?: string[]; // Mantener por compatibilidad o mapear a fotosGenerales
  tipoEpa: TipoEpaLite;
  tipoCultivoEpa: TipoCultivoEpaLite;
  estado: EstadoEpa;
};

export type CreateEpaInput = {
  nombre: string;
  descripcion: string;
  estado: EstadoEpa;
  tipoEpaId: number;
  tipoCultivoEpaId: number;
  cultivoId?: number;
  sintomas?: string;
  manejoYControl?: string;
  mesesProbables?: number[];
  temporadas?: string[];
  notasEstacionalidad?: string;
  tags?: string[];
  imagenes?: File[]; // Para envío de archivos
};

export type UpdateEpaInput = Partial<CreateEpaInput>;