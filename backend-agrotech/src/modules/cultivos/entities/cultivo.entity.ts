import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Lote } from '../../geo/entities/lote.entity';
import { SubLote } from '../../geo/entities/sublote.entity';
import { Actividad } from '../../activities/entities/actividad.entity';

@Entity('cultivos')
export class Cultivo extends BaseEntity {
  @Column()
  nombreCultivo: string;

  @Column({ nullable: true })
  tipoCultivo: string;

  @Column({ nullable: true })
  descripcion: string;

  // XOR: loteId O subLoteId
  @Column({ name: 'lote_id', nullable: true })
  loteId: number;

  @Column({ name: 'sublote_id', nullable: true })
  subLoteId: number;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @ManyToOne(() => SubLote)
  @JoinColumn({ name: 'sublote_id' })
  subLote: SubLote;

  @Column({ type: 'date', nullable: true })
  fechaSiembra: Date;

  @Column({ type: 'date', nullable: true })
  fechaFinalizacion: Date;

  @Column({ default: 'activo' })
  estado: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @OneToMany(() => Actividad, (actividad) => actividad.cultivo)
  actividades: Actividad[];
}
