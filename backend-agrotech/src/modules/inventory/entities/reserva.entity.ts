import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Insumo } from './insumo.entity';

@Entity('reservas')
export class Reserva extends BaseEntity {
    @Column()
    insumoId: number;

    @Column('float')
    cantidad: number;

    @Column({ type: 'date' })
    fechaReserva: Date;

    @Column({ nullable: true })
    motivo: string;

    @Column({
        type: 'enum',
        enum: ['ACTIVA', 'LIBERADA', 'UTILIZADA'],
        default: 'ACTIVA',
    })
    estado: string;

    @Column()
    usuarioId: number;

    @Column({ nullable: true })
    actividadId: number; // Link to future Activity

    @ManyToOne(() => Insumo, (insumo) => insumo.id)
    @JoinColumn({ name: 'insumoId' })
    insumo: Insumo;
}
