import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from './actividad.entity';
import { Insumo } from '../../inventory/entities/insumo.entity';

@Entity('actividades_insumos_reserva')
export class ActividadInsumoReserva extends BaseEntity {
    @Column()
    actividadId: number;

    @Column()
    insumoId: number;

    @Column('float')
    cantidadReservada: number;

    @ManyToOne(() => Actividad, (actividad) => actividad.insumosReserva)
    @JoinColumn({ name: 'actividadId' })
    actividad: Actividad;

    @ManyToOne(() => Insumo)
    @JoinColumn({ name: 'insumoId' })
    insumo: Insumo;
}
