import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Almacen } from './almacen.entity';
import { Proveedor } from './proveedor.entity';
import { Categoria } from './categoria.entity';
import { MovimientoInsumo } from './movimiento-insumo.entity';

@Entity('insumos')
export class Insumo extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  fotoUrl: string;

  @Column()
  presentacionTipo: string;

  @Column('float')
  presentacionCantidad: number;

  @Column()
  presentacionUnidad: string;

  @Column()
  unidadUso: string;

  @Column()
  tipoMateria: string;

  @Column('float')
  factorConversionUso: number;

  @Column('float')
  stockPresentacion: number;

  @Column('float')
  stockUso: number;

  @Column('float')
  precioUnitarioPresentacion: number;

  @Column('float')
  precioUnitarioUso: number;

  @Column('float')
  valorInventario: number;

  @Column()
  almacenId: number;

  @Column({ nullable: true })
  proveedorId: number;

  @Column()
  categoriaId: number;

  @Column()
  fechaRegistro: Date;

  @Column({ nullable: true })
  creadoPorUsuarioId: number;

  @ManyToOne(() => Almacen, (almacen) => almacen.insumos)
  @JoinColumn({ name: 'almacenId' })
  almacen: Almacen;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.insumos)
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedor;

  @ManyToOne(() => Categoria, (categoria) => categoria.insumos)
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;

  @OneToMany(() => MovimientoInsumo, (movimiento) => movimiento.insumo)
  movimientos: MovimientoInsumo[];
}
