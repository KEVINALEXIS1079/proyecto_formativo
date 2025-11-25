import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Insumo } from './insumo.entity';

@Entity('categorias')
export class Categoria extends BaseEntity {
  @Column()
  nombre: string;

  @OneToMany(() => Insumo, (insumo) => insumo.categoria)
  insumos: Insumo[];
}
