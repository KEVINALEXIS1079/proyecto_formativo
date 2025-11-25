import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('email_codes')
export class EmailCode extends BaseEntity {
  @Column()
  usuarioId: number;

  @Column({ length: 10 })
  tipo: string; // 'verify' | 'reset'

  @Column({ length: 6 })
  code: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
