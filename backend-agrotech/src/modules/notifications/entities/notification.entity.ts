
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('notificaciones')
export class Notification extends BaseEntity {
    @Column()
    titulo: string;

    @Column({ type: 'text' })
    mensaje: string;

    @Column({ default: false })
    leida: boolean;

    @Column({ nullable: true })
    tipo: string; // 'INFO', 'ALERT', 'ACTIVITY_ASSIGNED', 'USER_REGISTERED', etc.

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @Column()
    usuarioId: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;
}
