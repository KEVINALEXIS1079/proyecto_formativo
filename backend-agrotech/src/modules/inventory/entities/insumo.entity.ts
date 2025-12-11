import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Almacen } from './almacen.entity';
import { Proveedor } from './proveedor.entity';
import { Categoria } from './categoria.entity';
import { MovimientoInsumo } from './movimiento-insumo.entity';

export enum InsumoEstado {
  DISPONIBLE = 'DISPONIBLE',
  AGOTADO = 'AGOTADO',
  BAJO_STOCK = 'BAJO_STOCK',
  EN_USO = 'EN_USO',
  MANTENIMIENTO = 'MANTENIMIENTO',
  DADO_DE_BAJA = 'DADO_DE_BAJA',
  RESERVADO = 'RESERVADO',
}

export enum TipoInsumo {
  CONSUMIBLE = 'CONSUMIBLE',
  NO_CONSUMIBLE = 'NO_CONSUMIBLE',
}

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


  @Column({
    type: 'enum',
    enum: TipoInsumo,
    default: TipoInsumo.CONSUMIBLE
  })
  tipoInsumo: TipoInsumo;

  @Column('float', { nullable: true })
  costoAdquisicion: number;

  @Column('float', { nullable: true })
  valorResidual: number;

  @Column('float', { nullable: true })
  vidaUtilHoras: number;

  @Column('float', { default: 0 })
  horasUsadas: number;

  @Column('float', { default: 0 })
  stockReservado: number;

  @Column('float', { default: 0 })
  depreciacionAcumulada: number;

  @Column({ type: 'int', default: 0 })
  stockMinimo: number;

  @Column({
    type: 'enum',
    enum: InsumoEstado,
    default: InsumoEstado.DISPONIBLE,
  })
  estado: InsumoEstado;


  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoUnitario: number;

  @Column({ type: 'date', nullable: true })
  fechaAdquisicion: Date;

  @Column({ type: 'date', nullable: true })
  fechaUltimoMantenimiento: Date;

  @Column({ type: 'date', nullable: true })
  fechaBaja: Date;

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
