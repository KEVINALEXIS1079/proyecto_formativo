export type TipoEmpaque = 'bulto' | 'bolsa' | 'paquete' | 'tarro' | 'botella' | 'galón' | 'caja' | 'saco';

export type UnidadPresentacion = 'kg' | 'g' | 'lb' | 'L' | 'mL' | 'galón' | 'unidad';

export type UnidadBase = 'g' | 'cm3' | 'unidad';

export type TipoMovimiento = 'REGISTRO' | 'AJUSTE' | 'CONSUMO' | 'TRASLADO' | 'ELIMINACION' | 'INICIAL';

export interface CategoriaInsumo {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
}

export interface Almacen {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Insumo {
  id: number;
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
  tipoMateria: TipoMateria;
  tipoInsumo?: 'CONSUMIBLE' | 'NO_CONSUMIBLE';
  presentacionTipo: TipoEmpaque;
  presentacionCantidad: number;
  presentacionUnidad: UnidadPresentacion;
  unidadBase: UnidadBase;
  factorConversion: number;
  stockPresentaciones: number;
  stockTotalBase: number;
  stockTotalPresentacion: number;
  precioUnitarioPresentacion: number;
  precioUnitarioUso: number;
  precioTotal: number;
  fechaIngreso: string;
  categoria: CategoriaInsumo;
  proveedor: Proveedor;
  almacen: Almacen;
  // Campos de Activos Fijos
  estado?: 'DISPONIBLE' | 'EN_USO' | 'MANTENIMIENTO' | 'DADO_DE_BAJA';
  costoAdquisicion?: number;
  valorResidual?: number;
  vidaUtilHoras?: number;
  horasUsadas?: number;
  depreciacionAcumulada?: number;
  fechaUltimoMantenimiento?: string;
}

export interface CreateActivoFijoInput {
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
  categoriaId: number;
  almacenId: number;
  proveedorId?: number;
  costoAdquisicion: number;
  valorResidual: number;
  vidaUtilHoras: number;
  fechaAdquisicion: string;
}


export interface MovimientoInventario {
  id: number;
  tipoMovimiento: TipoMovimiento;
  cantidadPresentaciones: number;
  cantidadBase: number;
  valorMovimiento: number;
  descripcion: string;
  fechaMovimiento: string;
  origen: string;
  usuarioResponsable: any; // TODO: definir Usuario si necesario
  insumo?: Insumo;
  id_actividad_fk?: number;
}

export type TipoMateria = 'solido' | 'liquido';

export interface CreateInsumoInput {
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
  tipoMateria: TipoMateria;
  presentacionTipo: TipoEmpaque;
  presentacionCantidad: number;
  presentacionUnidad: UnidadPresentacion;
  unidadBase: UnidadBase;
  factorConversion: number;
  stockPresentaciones: number;
  precioUnitario: number;
  fechaIngreso: string;
  idCategoria: number;
  idProveedor: number;
  idAlmacen: number;
  descripcionOperacion?: string;
  creadoPorUsuarioId?: number; // Para el movimiento de inventario inicial
}

export interface UpdateInsumoInput extends Partial<CreateInsumoInput> { }

export interface RemoveInsumoInput {
  descripcion: string;
}

export interface CreateCategoriaInsumoInput {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoriaInsumoInput extends Partial<CreateCategoriaInsumoInput> { }

export interface CreateProveedorInput {
  nombre: string;
}

export interface UpdateProveedorInput extends Partial<CreateProveedorInput> { }

export interface CreateAlmacenInput {
  nombre: string;
  descripcion?: string;
}

export interface UpdateAlmacenInput extends Partial<CreateAlmacenInput> { }

export interface CreateMovimientoInput {
  tipoMovimiento: TipoMovimiento;
  cantidadPresentaciones: number;
  cantidadBase: number;
  valorMovimiento: number;
  descripcion: string;
  fechaMovimiento: string;
  origen: string;
  idUsuarioResponsable: number;
  idInsumo: number;
  almacenOrigenId?: number;
  almacenDestinoId?: number;
  actividadId?: number;
}

export interface UpdateMovimientoInput extends Partial<CreateMovimientoInput> { }

export interface InsumoFilters {
  q?: string;
  categoriaId?: number;
  proveedorId?: number;
  almacenId?: number;
  page?: number;
  limit?: number;
}

export interface MovimientoFilters {
  q?: string;
  tipoMovimiento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  idInsumo?: number;
  page?: number;
  limit?: number;
}