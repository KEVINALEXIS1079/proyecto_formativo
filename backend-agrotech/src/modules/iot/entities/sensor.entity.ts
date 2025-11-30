import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TipoSensor } from './tipo-sensor.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { SensorLectura } from './sensor-lectura.entity';

@Entity('sensores')
export class Sensor extends BaseEntity {
  @Column({ name: 'nombre_sensor' })
  nombre: string;

  @Column({ name: 'tipo_sensor_id' })
  tipoSensorId: number;

  @Column()
  protocolo: string;

  @Column({ name: 'endpoint_url', nullable: true })
  endpointUrl: string;

  @Column({ name: 'mqtt_broker', nullable: true })
  mqttBroker: string;

  @Column({ name: 'mqtt_port', nullable: true })
  mqttPort: number;

  @Column({ name: 'mqtt_topic', nullable: true })
  mqttTopic: string;

  @Column({ name: 'mqtt_username', nullable: true })
  mqttUsername: string;

  @Column({ name: 'mqtt_password', nullable: true })
  mqttPassword: string;

  @Column({ name: 'mqtt_qos', nullable: true })
  mqttQos: number;

  @Column('float', { name: 'valor_minimo_sensor', nullable: true })
  umbralMin: number;

  @Column('float', { name: 'valor_maximo_sensor', nullable: true })
  umbralMax: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'estado_conexion', default: 'DESCONECTADO' })
  estadoConexion: string;

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

  @ManyToOne(() => TipoSensor, (tipo) => tipo.sensores)
  @JoinColumn({ name: 'tipo_sensor_id' })
  tipoSensor: TipoSensor;

  @ManyToOne(() => Cultivo)
  @JoinColumn({ name: 'cultivoId' })
  cultivo: Cultivo;

  @OneToMany(() => SensorLectura, (lectura) => lectura.sensor)
  lecturas: SensorLectura[];
}
