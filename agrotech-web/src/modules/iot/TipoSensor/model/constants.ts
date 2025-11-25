// src/modules/iot/tipo-sensor/model/constants.ts

/** Debe coincidir EXACTO con los enums del backend */
export const UNIDADES_TIPO_SENSOR = [
  "%",   // PORCENTAJE
  "°C",  // CELSIUS
  "pH",  // PH
  "lx",  // LUX
  "ppm", // PPM
  "m/s", // M_S
  "mm",  // MM
  "bar", // BAR
] as const;

export type UnidadTipoSensor = typeof UNIDADES_TIPO_SENSOR[number];

/** Debe coincidir EXACTO con los enums del backend (patrones de formato) */
export const DECIMALES_TIPO_SENSOR = [
  "0",        // entero
  "0.0",      // 1 decimal
  "0.00",     // 2 decimales
  "0.000",    // 3 decimales
  "0.0000",   // 4 decimales
  "0.00000",  // 5 decimales
] as const;

export type DecimalesTipoSensor = typeof DECIMALES_TIPO_SENSOR[number];
