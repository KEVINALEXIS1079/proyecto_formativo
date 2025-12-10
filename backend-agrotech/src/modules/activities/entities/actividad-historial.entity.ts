import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from './actividad.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('actividad_historial')
export class ActividadHistorial extends BaseEntity {
  @Column()
  actividadId: number;

  @Column()
  usuarioId: number;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ type: 'jsonb', nullable: true })
  cambios: Record<string, { previo: any; nuevo: any }> | null;

  @ManyToOne(() => Actividad)
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
