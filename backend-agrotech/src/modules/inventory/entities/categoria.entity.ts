import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Insumo } from './insumo.entity';

@Entity('categorias')
export class Categoria extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion?: string;

  @Column({ default: 'CONSUMIBLE', nullable: true })
  tipoInsumo?: string; // CONSUMIBLE | NO_CONSUMIBLE

  @OneToMany(() => Insumo, (insumo) => insumo.categoria)
  insumos: Insumo[];
}
