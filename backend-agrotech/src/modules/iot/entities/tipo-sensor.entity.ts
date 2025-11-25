import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Sensor } from './sensor.entity';

@Entity('tipos_sensores')
export class TipoSensor extends BaseEntity {
  @Column()
  nombre: string;

  @Column()
  unidad: string;

  @Column({ default: 2 })
  decimales: number;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  imagen: string;

  @Column({ name: 'ttl_minutos', default: 5 })
  ttlMinutos: number; // Tiempo en minutos para considerar sensor desconectado

  @OneToMany(() => Sensor, (sensor) => sensor.tipoSensor)
  sensores: Sensor[];
}
