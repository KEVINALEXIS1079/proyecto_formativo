export type TipoEmpaque = 'bulto' | 'bolsa' | 'paquete' | 'tarro' | 'botella' | 'galón' | 'caja';

export type UnidadPresentacion = 'kg' | 'g' | 'lb' | 'L' | 'mL' | 'galón' | 'unidad';

export type UnidadBase = 'g' | 'cm3' | 'unidad';

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

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
  presentacionTipo: TipoEmpaque;
  presentacionCantidad: number;
  presentacionUnidad: UnidadPresentacion;
  unidadBase: UnidadBase;
  factorConversion: number;
  stockPresentaciones: number;
  stockTotalBase: number;
  stockTotalPresentacion: number;
  precioUnitario: number;
  precioTotal: number;
  fechaIngreso: string;
  categoria: CategoriaInsumo;
  proveedor: Proveedor;
  almacen: Almacen;
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
  insumo: Insumo;
  id_actividad_fk?: number;
}

export interface CreateInsumoInput {
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
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
}

export interface UpdateInsumoInput extends Partial<CreateInsumoInput> {}

export interface RemoveInsumoInput {
  descripcion: string;
}

export interface CreateCategoriaInsumoInput {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoriaInsumoInput extends Partial<CreateCategoriaInsumoInput> {}

export interface CreateProveedorInput {
  nombre: string;
}

export interface UpdateProveedorInput extends Partial<CreateProveedorInput> {}

export interface CreateAlmacenInput {
  nombre: string;
  descripcion?: string;
}

export interface UpdateAlmacenInput extends Partial<CreateAlmacenInput> {}

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
}

export interface UpdateMovimientoInput extends Partial<CreateMovimientoInput> {}