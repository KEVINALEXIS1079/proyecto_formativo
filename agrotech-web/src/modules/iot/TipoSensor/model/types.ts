// src/modules/iot/tipo-sensor/model/types.ts

/** Debe coincidir EXACTO con los enums del backend */
export type UnidadTipoSensor =
  | "%"
  | "°C"
  | "pH"
  | "lx"
  | "ppm"
  | "m/s"
  | "mm"
  | "bar";

/** Debe coincidir EXACTO con los enums del backend (patrones de formato) */
export type DecimalesTipoSensor =
  | "0"        // entero
  | "0.0"      // 1 decimal
  | "0.00"     // 2 decimales
  | "0.000"    // 3 decimales
  | "0.0000"   // 4 decimales
  | "0.00000"; // 5 decimales

export type TipoSensor = {
  id_tipo_sensor_pk: number;
  nombre_tipo_sensor: string;
  /** string del enum backend, p.ej. "%", "°C", "pH", ... */
  unidades_tipo_sensor?: UnidadTipoSensor | null;
  /** string del enum backend, p.ej. "0", "0.00", ... */
  decimales_tipo_sensor?: DecimalesTipoSensor | null;
  /** URL absoluta o ruta relativa (uploads/...) */
  imagen_tipo_sensor?: string | null;
  /** presente cuando viene con withDeleted */
  delete_at?: string | null;
};

export type CreateTipoSensorInput = {
  nombre_tipo_sensor: string;
  unidades_tipo_sensor?: UnidadTipoSensor;
  decimales_tipo_sensor?: DecimalesTipoSensor;
  /** File para upload o string (URL/ruta) para reutilizar existente */
  imagen_tipo_sensor?: File | string | null;
};

export type UpdateTipoSensorInput = Partial<CreateTipoSensorInput>;
