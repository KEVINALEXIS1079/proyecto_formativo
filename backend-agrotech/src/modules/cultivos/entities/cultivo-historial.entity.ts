import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Cultivo } from './cultivo.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('cultivo_historial')
export class CultivoHistorial extends BaseEntity {
  @Column({ name: 'cultivo_id' })
  cultivoId: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ type: 'jsonb', nullable: true })
  cambios: Record<string, { previo: any; nuevo: any }> | null;

  @ManyToOne(() => Cultivo)
  @JoinColumn({ name: 'cultivo_id' })
  cultivo: Cultivo;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
