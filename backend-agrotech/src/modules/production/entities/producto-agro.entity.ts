import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LoteProduccion } from './lote-produccion.entity';

@Entity('productos_agro')
export class ProductoAgro extends BaseEntity {
  @Column()
  nombre: string;

  @Column()
  unidadBase: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  imagen: string;

  @OneToMany(() => LoteProduccion, (lote) => lote.productoAgro)
  lotesProduccion: LoteProduccion[];
}
