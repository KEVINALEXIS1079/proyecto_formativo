import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Insumo } from './insumo.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { Actividad } from '../../activities/entities/actividad.entity';

@Entity('movimientos_insumos')
export class MovimientoInsumo extends BaseEntity {
  @Column()
  insumoId: number;

  @Column()
  tipo: string;

  @Column('float')
  cantidadPresentacion: number;

  @Column('float')
  cantidadUso: number;

  @Column('float')
  costoUnitarioPresentacion: number;

  @Column('float')
  costoUnitarioUso: number;

  @Column('float')
  costoTotal: number;

  @Column('float')
  valorInventarioResultante: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  actividadId: number;

  @Column()
  usuarioId: number;

  @Column({ nullable: true })
  almacenOrigenId: number;

  @Column({ nullable: true })
  almacenDestinoId: number;

  @ManyToOne(() => Insumo, (insumo) => insumo.movimientos)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Actividad)
  @JoinColumn({ name: 'actividadId' })
  actividad: Actividad;
}
