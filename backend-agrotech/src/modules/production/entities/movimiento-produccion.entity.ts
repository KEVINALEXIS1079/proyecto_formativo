import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LoteProduccion } from './lote-produccion.entity';
import { Venta } from './venta.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('movimientos_produccion')
export class MovimientoProduccion extends BaseEntity {
  @Column()
  loteProduccionId: number;

  @Column()
  tipo: string;

  @Column('float')
  cantidadKg: number;

  @Column('float')
  costoUnitarioKg: number;

  @Column('float')
  costoTotal: number;

  @Column({ nullable: true })
  ventaId: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column()
  usuarioId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @ManyToOne(() => LoteProduccion, (lote) => lote.movimientos)
  @JoinColumn({ name: 'loteProduccionId' })
  loteProduccion: LoteProduccion;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'ventaId' })
  venta: Venta;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
