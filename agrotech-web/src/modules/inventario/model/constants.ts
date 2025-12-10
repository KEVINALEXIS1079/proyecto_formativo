import type { TipoEmpaque, UnidadPresentacion, UnidadBase, TipoMateria, TipoMovimiento } from './types';

// Opciones para selects de formularios
export const TIPO_EMPAQUE_OPTIONS: { key: TipoEmpaque; label: string }[] = [
  { key: "bulto", label: "Bulto" },
  { key: "bolsa", label: "Bolsa" },
  { key: "paquete", label: "Paquete" },
  { key: "tarro", label: "Tarro" },
  { key: "botella", label: "Botella" },
  { key: "galón", label: "Galón" },
  { key: "caja", label: "Caja" },
];

export const UNIDAD_PRESENTACION_OPTIONS: { key: UnidadPresentacion; label: string }[] = [
  { key: "kg", label: "Kilogramos" },
  { key: "g", label: "Gramos" },
  { key: "lb", label: "Libras" },
  { key: "L", label: "Litros" },
  { key: "mL", label: "Mililitros" },
  { key: "galón", label: "Galón" },
  { key: "unidad", label: "Unidad" },
];

export const TIPO_MATERIA_OPTIONS: { key: TipoMateria; label: string }[] = [
  { key: "solido", label: "Sólido" },
  { key: "liquido", label: "Líquido" },
];

export const TIPO_MOVIMIENTO_OPTIONS: { key: TipoMovimiento; label: string }[] = [
  { key: "REGISTRO", label: "Registro" },
  { key: "AJUSTE", label: "Ajuste" },
  { key: "CONSUMO", label: "Consumo" },
  { key: "TRASLADO", label: "Traslado" },
  { key: "ELIMINACION", label: "Eliminación" },
  { key: "INICIAL", label: "Inicial" },
];

// Tabla de conversión para unidades
export const CONVERSION_TABLE: { [key: string]: { factor: number; unidadBase: UnidadBase } } = {
  'kg': { factor: 1000, unidadBase: 'g' },
  'g': { factor: 1, unidadBase: 'g' },
  'lb': { factor: 453.592, unidadBase: 'g' },
  'L': { factor: 1000, unidadBase: 'cm3' },
  'mL': { factor: 1, unidadBase: 'cm3' },
  'galón': { factor: 3785, unidadBase: 'cm3' },
  'unidad': { factor: 1, unidadBase: 'unidad' },
};