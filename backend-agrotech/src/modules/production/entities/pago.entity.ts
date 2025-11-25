import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Venta } from './venta.entity';

@Entity('pagos')
export class Pago extends BaseEntity {
  @Column()
  ventaId: number;

  @Column()
  metodo: string;

  @Column('float')
  monto: number;

  @Column()
  moneda: string;

  @Column({ nullable: true })
  referencia: string;

  @ManyToOne(() => Venta, (venta) => venta.pagos)
  @JoinColumn({ name: 'ventaId' })
  venta: Venta;
}
