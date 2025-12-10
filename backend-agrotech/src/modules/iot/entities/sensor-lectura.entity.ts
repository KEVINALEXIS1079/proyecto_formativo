import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Sensor } from './sensor.entity';

@Entity('sensor_lecturas')
export class SensorLectura extends BaseEntity {
  @Column({ name: 'sensor_id' })
  sensorId: number;

  @Column({ nullable: true })
  valor: string;

  @Column({
    name: 'fecha_lectura',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaLectura: Date;

  @Column({ nullable: true })
  unidad: string;

  @Column({ nullable: true })
  observaciones: string;

  @ManyToOne(() => Sensor, (sensor) => sensor.lecturas)
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;
}
