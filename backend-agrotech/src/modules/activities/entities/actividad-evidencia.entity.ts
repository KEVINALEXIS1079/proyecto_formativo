import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from './actividad.entity';

@Entity('actividades_evidencias')
export class ActividadEvidencia extends BaseEntity {
  @Column()
  actividadId: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column('simple-array')
  imagenes: string[];

  @ManyToOne(() => Actividad, (actividad) => actividad.evidencias)
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;
}
