import { Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Cliente } from './cliente.entity';
import { VentaDetalle } from './venta-detalle.entity';
import { Pago } from './pago.entity';
import { Factura } from './factura.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('ventas')
export class Venta extends BaseEntity {
  @Column()
  fecha: Date;

  @Column()
  clienteId: number;

  @Column('float')
  subtotal: number;

  @Column('float')
  impuestos: number;

  @Column('float')
  descuento: number;

  @Column('float')
  total: number;

  @Column()
  estado: string;

  @Column()
  usuarioId: number;

  @Column({ name: 'anulada_por_usuario_id', nullable: true })
  anuladaPorUsuarioId: number;

  @Column({ name: 'fecha_anulacion', nullable: true })
  fechaAnulacion: Date;

  @ManyToOne(() => Cliente, (cliente) => cliente.ventas)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @OneToMany(() => VentaDetalle, (detalle) => detalle.venta)
  detalles: VentaDetalle[];

  @OneToMany(() => Pago, (pago) => pago.venta)
  pagos: Pago[];

  @OneToOne(() => Factura, (factura) => factura.venta)
  factura: Factura;
}
