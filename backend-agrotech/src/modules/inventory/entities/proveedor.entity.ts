import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Insumo } from './insumo.entity';

@Entity('proveedores')
export class Proveedor extends BaseEntity {
  @Column()
  nombre: string;

  @OneToMany(() => Insumo, (insumo) => insumo.proveedor)
  insumos: Insumo[];
}
