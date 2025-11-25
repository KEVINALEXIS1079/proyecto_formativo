import type { CategoriaInsumo, Proveedor, Almacen, Insumo, MovimientoInventario } from './types';

export function adaptCategoriaInsumo(raw: any): CategoriaInsumo {
  return {
    id: raw.id_categoria_insumo_pk,
    nombre: raw.nombre_categoria_insumo,
    descripcion: raw.descripcion,
  };
}

export function adaptProveedor(raw: any): Proveedor {
  return {
    id: raw.id_proveedor_pk,
    nombre: raw.nombre_proveedor,
  };
}

export function adaptAlmacen(raw: any): Almacen {
  return {
    id: raw.id_almacen_pk,
    nombre: raw.nombre_almacen,
    descripcion: raw.descripcion,
  };
}

export function adaptInsumo(raw: any): Insumo {
  return {
    id: raw.id_insumo_pk,
    nombre: raw.nombre_insumo,
    descripcion: raw.descripcion_insumo,
    imagenUrl: raw.imagen_url,
    presentacionTipo: raw.presentacion_tipo,
    presentacionCantidad: raw.presentacion_cantidad,
    presentacionUnidad: raw.presentacion_unidad,
    unidadBase: raw.unidad_base,
    factorConversion: raw.factor_conversion,
    stockPresentaciones: raw.stock_presentaciones,
    stockTotalBase: raw.stock_total_base,
    stockTotalPresentacion: raw.stock_total_presentacion,
    precioUnitario: raw.precio_unitario_actual,
    precioTotal: raw.precio_total,
    fechaIngreso: raw.fecha_ingreso,
    categoria: adaptCategoriaInsumo(raw.categoria),
    proveedor: adaptProveedor(raw.proveedor),
    almacen: adaptAlmacen(raw.almacen),
  };
}

export function adaptMovimiento(raw: any): MovimientoInventario {
  return {
    id: raw.id_movimiento_pk,
    tipoMovimiento: raw.tipo_movimiento,
    cantidadPresentaciones: raw.cantidad_presentaciones,
    cantidadBase: raw.cantidad_base,
    valorMovimiento: raw.valor_movimiento,
    descripcion: raw.descripcion,
    fechaMovimiento: raw.fecha_movimiento,
    origen: raw.origen,
    usuarioResponsable: raw.usuario_responsable, // TODO: adaptar si necesario
    insumo: adaptInsumo(raw.insumo),
    id_actividad_fk: raw.id_actividad_fk,
  };
}