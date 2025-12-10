import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Sensor } from './sensor.entity';

@Entity('sensor_lecturas')
@Index(['sensorId', 'fechaLectura']) // Optimization for Time-Series queries
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

  @ManyToOne(() => Sensor, (sensor) => sensor.lecturas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;
}
