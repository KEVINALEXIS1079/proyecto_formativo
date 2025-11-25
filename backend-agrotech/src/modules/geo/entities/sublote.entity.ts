import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Lote } from './lote.entity';

@Entity('sublotes')
export class SubLote extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ name: 'lote_id' })
  loteId: number;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326, nullable: true })
  geom: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  areaM2: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  areaHa: number;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  centroide: string;

  @Column({ nullable: true })
  descripcion: string;
}
