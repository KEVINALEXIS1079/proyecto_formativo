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

  // NUEVOS CAMPOS PARA ACTIVOS FIJOS Y DEPRECIACIÓN
  @Column({ default: 'CONSUMIBLE' })
  tipoInsumo: string; // 'CONSUMIBLE' | 'NO_CONSUMIBLE'

  // Para NO CONSUMIBLES (Activos Fijos)
  @Column('float', { nullable: true })
  costoAdquisicion: number; // Costo inicial del activo

  @Column('float', { nullable: true })
  valorResidual: number; // Valor al final de vida útil

  @Column('float', { nullable: true })
  vidaUtilHoras: number; // Vida útil estimada en horas/usos

  @Column('float', { default: 0 })
  horasUsadas: number; // Horas/usos acumulados

  @Column('float', { default: 0 })
  stockReservado: number; // Stock comprometido en actividades pendientes

  @Column('float', { default: 0 })
  depreciacionAcumulada: number; // Depreciación total acumulada

  @Column({ default: 'DISPONIBLE' })
  estado: string; // 'DISPONIBLE' | 'EN_USO' | 'MANTENIMIENTO' | 'DADO_DE_BAJA'

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
