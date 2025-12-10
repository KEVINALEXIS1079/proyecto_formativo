import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Sensor } from './sensor.entity';

@Entity('iot_global_config')
export class IotGlobalConfig extends BaseEntity {
  @Column({ default: 'Configuracion Principal' })
  name: string;

  @Column({ default: 'test.mosquitto.org' })
  broker: string;

  @Column({ default: 1883 })
  port: number;

  @Column({ default: 'mqtt' })
  protocol: string;

  @Column({ name: 'topic_prefix', default: 'agrotech/' })
  topicPrefix: string;

  @Column('simple-array', { name: 'default_topics', default: '' })
  defaultTopics: string[];

  @Column('simple-array', { name: 'custom_topics', default: '' })
  customTopics: string[];

  @Column({ name: 'lote_id', nullable: true })
  loteId: number;

  @Column({ name: 'sub_lote_id', nullable: true })
  subLoteId: number;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'default_sensors_initialized', default: false })
  defaultSensorsInitialized: boolean;

  @OneToMany(() => Sensor, (sensor) => sensor.globalConfig)
  sensores: Sensor[];
}
