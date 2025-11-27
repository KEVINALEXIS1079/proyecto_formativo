import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Actividad } from '../../activities/entities/actividad.entity';
import { Insumo } from '../../inventory/entities/insumo.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { Venta } from '../../production/entities/venta.entity';

@Entity('transacciones_financieras')
export class TransaccionFinanciera extends BaseEntity {
  @Column()
  tipo: string; // GASTO_ACTIVIDAD, INGRESO_VENTA, GASTO_COMPRA

  @Column()
  categoria: string; // MANO_OBRA, INSUMO, SERVICIO, VENTA, COMPRA

  @Column('float')
  monto: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column()
  fecha: Date;

  @Column({ nullable: true })
  actividadId: number;

  @Column({ nullable: true })
  insumoId: number;

  @Column({ nullable: true })
  ventaId: number;

  @Column()
  usuarioId: number;

  @ManyToOne(() => Actividad)
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;

  @ManyToOne(() => Insumo)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'ventaId' })
  venta: Venta;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
