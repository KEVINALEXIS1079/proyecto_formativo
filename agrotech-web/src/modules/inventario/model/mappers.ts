import type { CategoriaInsumo, Proveedor, Almacen, Insumo, MovimientoInventario } from './types';

export function adaptCategoriaInsumo(raw: any): CategoriaInsumo {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
  };
}

export function adaptProveedor(raw: any): Proveedor {
  return {
    id: raw.id,
    nombre: raw.nombre,
  };
}

export function adaptAlmacen(raw: any): Almacen {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
  };
}

export function adaptInsumo(raw: any): Insumo {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    imagenUrl: raw.fotoUrl,
    tipoMateria: raw.tipoMateria?.toLowerCase() || 'solido', // Asegurar minúsculas y valor por defecto
    presentacionTipo: raw.presentacionTipo,
    presentacionCantidad: raw.presentacionCantidad,
    presentacionUnidad: raw.presentacionUnidad,
    unidadBase: raw.unidadUso,
    factorConversion: raw.factorConversionUso,
    stockPresentaciones: raw.stockPresentacion,
    stockTotalBase: raw.stockUso,
    stockTotalPresentacion: raw.stockPresentacion,
    precioUnitarioPresentacion: raw.precioUnitarioPresentacion,
    precioUnitarioUso: raw.precioUnitarioUso,
    precioTotal: raw.valorInventario,
    fechaIngreso: raw.fechaRegistro,
    categoria: raw.categoria ? adaptCategoriaInsumo(raw.categoria) : { id: 0, nombre: 'Sin categoría', descripcion: '' },
    proveedor: raw.proveedor ? adaptProveedor(raw.proveedor) : { id: 0, nombre: 'Sin proveedor' },
    almacen: raw.almacen ? adaptAlmacen(raw.almacen) : { id: 0, nombre: 'Sin almacén', descripcion: '' },
  };
}

export function adaptMovimiento(raw: any): MovimientoInventario {
  // Adaptar usuario responsable con datos completos
  const usuarioResponsable = raw.usuario ? {
    id: raw.usuario.id,
    nombreUsuario: raw.usuario.nombreUsuario || raw.usuario.nombre || raw.usuario.name || 'Usuario',
    identificacion: raw.usuario.identificacion || raw.usuario.documento || 'N/A',
    email: raw.usuario.email || 'N/A'
  } : {
    id: raw.usuarioId || raw.usuario_id || 0,
    nombreUsuario: raw.usuarioNombre || raw.usuario_nombre || 'Usuario',
    identificacion: raw.usuarioIdentificacion || raw.usuario_identificacion || 'N/A',
    email: raw.usuarioEmail || raw.usuario_email || 'N/A'
  };

  return {
    id: raw.id,
    tipoMovimiento: raw.tipo || raw.tipo_movimiento,
    cantidadPresentaciones: raw.cantidadPresentacion || raw.cantidad_presentaciones || 0,
    cantidadBase: raw.cantidadUso || raw.cantidad_uso || 0,
    valorMovimiento: raw.costoTotal || raw.costo_total || 0,
    descripcion: raw.descripcion || '',
    fechaMovimiento: raw.fechaMovimiento || raw.fecha_movimiento || raw.createdAt || raw.created_at,
    origen: raw.almacenOrigenId || raw.almacen_origen_id ? 'Traslado' : 'Directo',
    usuarioResponsable,
    insumo: raw.insumo ? adaptInsumo(raw.insumo) : undefined,
    id_actividad_fk: raw.actividadId || raw.actividad_id,
  };
}