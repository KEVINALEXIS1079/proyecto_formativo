import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Insumo } from './insumo.entity';

@Entity('almacenes')
export class Almacen extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  ubicacion: string;

  @OneToMany(() => Insumo, (insumo) => insumo.almacen)
  insumos: Insumo[];
}
