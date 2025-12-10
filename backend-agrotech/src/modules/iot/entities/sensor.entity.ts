import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TipoSensor } from './tipo-sensor.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { SensorLectura } from './sensor-lectura.entity';
import { Lote } from '../../geo/entities/lote.entity';
import { SubLote } from '../../geo/entities/sublote.entity';
import { IotGlobalConfig } from './iot-global-config.entity';

@Entity('sensores')
export class Sensor extends BaseEntity {
  @Column({ name: 'nombre_sensor' })
  nombre: string;

  @Column({ name: 'tipo_sensor_id', nullable: true })
  tipoSensorId: number;

  @Column()
  protocolo: string;

  @Column({ name: 'endpoint_url', nullable: true })
  endpointUrl: string;

  @Column({ name: 'mqtt_topic', nullable: true })
  mqttTopic: string;

  @Column('float', { name: 'valor_minimo_sensor', nullable: true })
  umbralMin: number;

  @Column('float', { name: 'valor_maximo_sensor', nullable: true })
  umbralMax: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'estado_conexion', default: 'DESCONECTADO' })
  estadoConexion: string;

  @Column('text', { name: 'estado', nullable: true })
  estado: string | null;

  @Column({ name: 'ultimo_valor', nullable: true })
  ultimoValor: string;

  @Column({ name: 'ultima_medicion', nullable: true })
  ultimaLectura: Date;

  @Column({ name: 'last_seen_at', nullable: true })
  lastSeenAt: Date;

  @Column({ nullable: true })
  cultivoId: number;

  @Column({ nullable: true })
  creadoPorUsuarioId: number;

  @Column({ name: 'global_config_id', nullable: true })
  globalConfigId: number;

  @ManyToOne(() => IotGlobalConfig, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'global_config_id' })
  globalConfig: IotGlobalConfig;

  @Column({ name: 'lote_id', nullable: true })
  loteId: number;

  @Column({ name: 'sub_lote_id', nullable: true })
  subLoteId: number;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @ManyToOne(() => SubLote)
  @JoinColumn({ name: 'sub_lote_id' })
  subLote: SubLote;

  @ManyToOne(() => TipoSensor, (tipo) => tipo.sensores)
  @JoinColumn({ name: 'tipo_sensor_id' })
  tipoSensor: TipoSensor;

  @ManyToOne(() => Cultivo)
  @JoinColumn({ name: 'cultivoId' })
  cultivo: Cultivo;

  @OneToMany(() => SensorLectura, (lectura) => lectura.sensor)
  lecturas: SensorLectura[];
}
