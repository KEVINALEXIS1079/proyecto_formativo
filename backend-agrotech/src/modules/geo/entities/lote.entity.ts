import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SubLote } from './sublote.entity';

@Entity('lotes')
export class Lote extends BaseEntity {
  @Column()
  nombre: string;

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

  @Column({ default: 'activo' })
  estado: string;

  @OneToMany(() => SubLote, subLote => subLote.lote)
  sublotes: SubLote[];
}
