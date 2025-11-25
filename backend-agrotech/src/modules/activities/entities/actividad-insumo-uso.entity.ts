import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from './actividad.entity';
// import { Insumo } from '../../inventory/entities/insumo.entity'; // Circular dependency, handle carefully
// import { MovimientoInsumo } from '../../inventory/entities/movimiento-insumo.entity';

@Entity('actividades_insumos_uso')
export class ActividadInsumoUso extends BaseEntity {
  @Column()
  actividadId: number;

  @Column()
  insumoId: number;

  @Column('float')
  cantidadUso: number;

  @Column('float')
  costoUnitarioUso: number;

  @Column('float')
  costoTotal: number;

  @Column({ nullable: true })
  movimientoInsumoId: number;

  @ManyToOne(() => Actividad, (actividad) => actividad.insumosUso)
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;
}
