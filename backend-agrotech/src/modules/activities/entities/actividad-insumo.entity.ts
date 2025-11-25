import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from './actividad.entity';
import { Insumo } from '../../inventory/entities/insumo.entity';

@Entity('actividad_insumos')
export class ActividadInsumo extends BaseEntity {
  @Column({ name: 'actividad_id' })
  actividadId: number;

  @Column({ name: 'insumo_id' })
  insumoId: number;

  @Column('float', { name: 'cantidad_usada' })
  cantidadUsada: number;

  @Column({ name: 'unidad' })
  unidad: string;

  @Column('float', { name: 'costo_unitario' })
  costoUnitario: number;

  @Column('float', { name: 'costo_total' })
  costoTotal: number;

  @ManyToOne(() => Actividad)
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;

  @ManyToOne(() => Insumo)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;
}
