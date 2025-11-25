import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductoAgro } from './producto-agro.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { MovimientoProduccion } from './movimiento-produccion.entity';

@Entity('lotes_produccion')
export class LoteProduccion extends BaseEntity {
  @Column()
  productoAgroId: number;

  @Column({ nullable: true })
  cultivoId: number;

  @Column({ nullable: true })
  loteId: number;

  @Column({ nullable: true })
  subLoteId: number;

  @Column({ nullable: true })
  actividadCosechaId: number;

  @Column('float')
  cantidadKg: number;

  @Column('float', { name: 'stock_disponible_kg' })
  stockDisponibleKg: number;

  @Column('float')
  costoUnitarioKg: number;

  @Column('float')
  costoTotal: number;

  @Column('float')
  precioSugeridoKg: number;

  @ManyToOne(() => ProductoAgro, (producto) => producto.lotesProduccion)
  @JoinColumn({ name: 'productoAgroId' })
  productoAgro: ProductoAgro;

  @ManyToOne(() => Cultivo)
  @JoinColumn({ name: 'cultivoId' })
  cultivo: Cultivo;

  @OneToMany(() => MovimientoProduccion, (movimiento) => movimiento.loteProduccion)
  movimientos: MovimientoProduccion[];
}
