import type { Sensor, SensorDTO } from "./types";

/**
 * Mapea el formato que viene del backend al formato del frontend.
 */
export function mapSensorFromApi(data: any): Sensor {
  return {
    id_sensor_pk: data.id_sensor_pk,
    nombre_sensor: data.nombre_sensor,
    activo: data.activo,
    broker_sensor: data.broker_sensor,
    puerto_sensor: data.puerto_sensor,
    topico_sensor: data.topico_sensor,
    ultimo_valor: data.ultimo_valor,
    ultima_medicion: data.ultima_medicion,
    valor_minimo_sensor: data.valor_minimo_sensor,
    valor_maximo_sensor: data.valor_maximo_sensor,
    tipo_sensor: {
      id_tipo_sensor_pk: data.tipo_sensor?.id_tipo_sensor_pk ?? 0,
      nombre_tipo_sensor: data.tipo_sensor?.nombre_tipo_sensor ?? "",
      unidades_tipo_sensor: data.tipo_sensor?.unidades_tipo_sensor ?? null,
      decimales_tipo_sensor: data.tipo_sensor?.decimales_tipo_sensor ?? null,
    },
    lote: {
      id_lote_pk: data.lote?.id_lote_pk ?? 0,
      nombre_lote: data.lote?.nombre_lote ?? null,
      codigo: data.lote?.codigo ?? null,
    },
    delete_at: data.delete_at ?? null,
  };
}

/**
 * Mapea el formato del frontend al formato que espera el backend.
 */
export function mapSensorToApi(sensor: SensorDTO) {
  return {
    nombre_sensor: sensor.nombre_sensor,
    broker_sensor: sensor.broker_sensor,
    puerto_sensor: sensor.puerto_sensor,
    topico_sensor: sensor.topico_sensor,
    valor_minimo_sensor: sensor.valor_minimo_sensor,
    valor_maximo_sensor: sensor.valor_maximo_sensor,
    activo: sensor.activo,
    id_lote_fk: sensor.id_lote_fk,
    id_tipo_sensor_fk: sensor.id_tipo_sensor_fk,
  };
}
