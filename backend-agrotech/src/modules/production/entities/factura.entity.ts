import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Venta } from './venta.entity';

@Entity('facturas')
export class Factura extends BaseEntity {
  @Column()
  ventaId: number;

  @Column()
  numero: string;

  @Column()
  prefijo: string;

  @Column()
  fechaEmision: Date;

  @Column()
  vencimiento: Date;

  @Column({ nullable: true })
  qrUrl: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @OneToOne(() => Venta, (venta) => venta.factura)
  @JoinColumn({ name: 'ventaId' })
  venta: Venta;
}
