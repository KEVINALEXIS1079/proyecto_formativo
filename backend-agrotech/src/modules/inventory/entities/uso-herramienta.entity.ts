import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from '../../activities/entities/actividad.entity';
import { Insumo } from './insumo.entity';

@Entity('usos_herramientas')
export class UsoHerramienta extends BaseEntity {
    @Column()
    actividadId: number;

    @Column()
    insumoId: number;

    @Column('float')
    horasUsadas: number;

    @Column('float')
    depreciacionGenerada: number;

    @Column('float')
    valorEnLibrosAntes: number;

    @Column('float')
    valorEnLibrosDespues: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaUso: Date;

    @ManyToOne(() => Actividad)
    @JoinColumn({ name: 'actividadId' })
    actividad: Actividad;

    @ManyToOne(() => Insumo)
    @JoinColumn({ name: 'insumoId' })
    insumo: Insumo;
}
