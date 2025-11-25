import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Venta } from './venta.entity';
import { ProductoAgro } from './producto-agro.entity';
import { LoteProduccion } from './lote-produccion.entity';
import { Cultivo } from '../../geo/entities/cultivo.entity';

@Entity('ventas_detalles')
export class VentaDetalle extends BaseEntity {
  @Column()
  ventaId: number;

  @Column()
  productoAgroId: number;

  @Column({ nullable: true })
  loteProduccionId: number;

  @Column({ nullable: true })
  cultivoId: number;

  @Column('float')
  cantidadKg: number;

  @Column('float')
  precioUnitarioKg: number;

  @Column('float')
  precioTotal: number;

  @Column('float')
  costoUnitarioKg: number;

  @Column('float')
  costoTotal: number;

  @ManyToOne(() => Venta, (venta) => venta.detalles)
  @JoinColumn({ name: 'ventaId' })
  venta: Venta;

  @ManyToOne(() => ProductoAgro)
  @JoinColumn({ name: 'productoAgroId' })
  productoAgro: ProductoAgro;

  @ManyToOne(() => LoteProduccion)
  @JoinColumn({ name: 'loteProduccionId' })
  loteProduccion: LoteProduccion;

  @ManyToOne(() => Cultivo)
  @JoinColumn({ name: 'cultivoId' })
  cultivo: Cultivo;
}
