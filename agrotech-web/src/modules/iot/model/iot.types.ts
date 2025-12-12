export interface IoTConfig {
  id?: number;
  name?: string;
  broker: string;
  port: number;
  protocol: 'mqtt' | 'http' | 'websocket';
  loteId?: number;
  subLoteId?: number;
  topicPrefix: string;
  defaultTopics: string[];
  customTopics: string[];
  username?: string;
  password?: string;
  autoDiscover?: boolean;
  activo?: boolean;
}

export interface TipoSensor {
  id: number;
  nombre: string;
  unidad: string;
  descripcion?: string;
}

export interface Sensor {
  id: number;
  nombre: string;
  tipoSensorId: number;
  tipoSensor?: TipoSensor;
  protocolo: 'HTTP' | 'MQTT' | 'WEBSOCKET';
  cultivoId?: number;
  loteId?: number;
  subLoteId?: number;
  umbralMin?: number;
  umbralMax?: number;

  // Config
  globalConfigId?: number;
  mqttTopic?: string;
  endpointUrl?: string;

  activo: boolean;
  ultimoValor?: number;
  ultimaLectura?: string; // ISO date
  estadoConexion?: 'CONECTADO' | 'DESCONECTADO' | 'ERROR';
  estado?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SensorLectura {
  id: number;
  sensorId: number;
  valor: number;
  fechaLectura: string; // ISO date
}

export interface LotMetrics {
  loteId: number;
  subLoteId?: number | null;
  loteNombre: string;
  subLoteNombre?: string | null;
  avg: number;
  min: number;
  max: number;
  count: number;
}

export interface ComparisonRow {
  loteId: number;
  loteNombre: string;
  metric: number;
  isBest: boolean;
  isWorst: boolean;
}
