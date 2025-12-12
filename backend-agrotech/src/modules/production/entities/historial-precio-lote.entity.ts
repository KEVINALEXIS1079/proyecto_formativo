import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LoteProduccion } from './lote-produccion.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('historial_precios_lote')
export class HistorialPrecioLote extends BaseEntity {
  @Column()
  loteProduccionId: number;

  @Column('float')
  precioAnterior: number;

  @Column('float')
  precioNuevo: number;

  @Column()
  usuarioId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ nullable: true })
  razon: string;

  @ManyToOne(() => LoteProduccion)
  @JoinColumn({ name: 'loteProduccionId' })
  loteProduccion: LoteProduccion;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
