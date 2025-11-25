import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from './actividad.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('actividades_responsables')
export class ActividadResponsable extends BaseEntity {
  @Column()
  actividadId: number;

  @Column()
  usuarioId: number;

  @Column('float')
  horas: number;

  @Column('float')
  precioHora: number;

  @Column('float')
  costo: number;

  @ManyToOne(() => Actividad, (actividad) => actividad.responsables)
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
