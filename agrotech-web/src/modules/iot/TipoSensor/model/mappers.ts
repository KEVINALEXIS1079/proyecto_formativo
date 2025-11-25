// src/modules/iot/tipo-sensor/model/mappers.ts

import type {
  TipoSensor,
  CreateTipoSensorInput,
  UpdateTipoSensorInput,
} from "./types";

/**
 * Mapea los datos que vienen del backend hacia el modelo usado en el frontend.
 */
export function mapTipoSensorFromApi(data: any): TipoSensor {
  return {
    id_tipo_sensor_pk: data.id_tipo_sensor_pk ?? data.id_tipo_sensor ?? data.id,
    nombre_tipo_sensor: data.nombre_tipo_sensor ?? data.nombre,
    unidades_tipo_sensor: data.unidades_tipo_sensor ?? data.unidades ?? null,
    decimales_tipo_sensor: data.decimales_tipo_sensor ?? data.decimales ?? null,
    imagen_tipo_sensor: data.imagen_tipo_sensor ?? data.imagen ?? null,
    delete_at: data.delete_at ?? null,
  };
}

/**
 * Mapea los datos del frontend (formulario de creación o edición)
 * hacia el formato que espera el backend.
 */
export function mapTipoSensorToApi(
  tipo: CreateTipoSensorInput | UpdateTipoSensorInput
) {
  return {
    nombre_tipo_sensor: tipo.nombre_tipo_sensor,
    unidades_tipo_sensor: tipo.unidades_tipo_sensor,
    decimales_tipo_sensor: tipo.decimales_tipo_sensor,
    imagen_tipo_sensor: tipo.imagen_tipo_sensor,
  };
}
