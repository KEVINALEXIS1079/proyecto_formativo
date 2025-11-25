// src/modules/iot/Sensor/model/types.ts
export type TipoSensorLite = {
  id_tipo_sensor_pk: number;
  nombre_tipo_sensor: string;
  unidades_tipo_sensor?: string | null;
};

export type LoteLite = {
  id_lote_pk: number;
  nombre_lote?: string | null;
  codigo?: string | null;
};

export type Sensor = {
  id_sensor_pk: number;
  nombre_sensor: string;
  activo: boolean;
  broker_sensor: string;
  puerto_sensor: number;
  topico_sensor: string;
  ultimo_valor: number | null;
  ultima_medicion: string | null; // ISO
  valor_minimo_sensor: number | null;
  valor_maximo_sensor: number | null;
  tipo_sensor: {
    id_tipo_sensor_pk: number;
    nombre_tipo_sensor: string;
    unidades_tipo_sensor?: string | null;
    decimales_tipo_sensor?: string | null;
  };
  lote: {
    id_lote_pk: number;
    nombre_lote?: string | null;
    codigo?: string | null;
  };
  delete_at?: string | null;
};

export type CreateSensorInput = {
  nombre_sensor: string;
  broker_sensor: string;
  puerto_sensor: number;
  topico_sensor: string;
  valor_minimo_sensor: number;
  valor_maximo_sensor: number;
  activo?: boolean;
  id_lote_fk: number;
  id_tipo_sensor_fk: number;
};

export type UpdateSensorInput = Partial<CreateSensorInput>;

export type SensorDTO = CreateSensorInput;

export type SensorLectura = {
  id_lectura_pk: number;
  valor: number;
  fecha: string; // ISO
};
