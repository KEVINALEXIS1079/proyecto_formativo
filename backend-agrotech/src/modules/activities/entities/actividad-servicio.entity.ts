import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from './actividad.entity';

@Entity('actividades_servicios')
export class ActividadServicio extends BaseEntity {
  @Column()
  actividadId: number;

  @Column()
  nombreServicio: string;

  @Column('float')
  horas: number;

  @Column('float')
  precioHora: number;

  @Column('float')
  costo: number;

  @ManyToOne(() => Actividad, (actividad) => actividad.servicios)
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;
}
