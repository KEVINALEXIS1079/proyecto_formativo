import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from './actividad.entity';
import { Insumo } from '../../inventory/entities/insumo.entity';

@Entity('actividades_herramientas')
export class ActividadHerramienta extends BaseEntity {
    @Column()
    actividadId: number;

    @Column()
    activoFijoId: number;

    @Column('float')
    horasEstimadas: number;

    @ManyToOne(() => Actividad, (actividad) => actividad.herramientas)
    @JoinColumn({ name: 'actividadId' })
    actividad: Actividad;

    @ManyToOne(() => Insumo)
    @JoinColumn({ name: 'activoFijoId' })
    activoFijo: Insumo;
}
