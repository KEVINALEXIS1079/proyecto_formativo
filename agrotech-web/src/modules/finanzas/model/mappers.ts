/* mappers DTO <-> tipos UI */

import type { Producto, Venta, VentaDetalle, CreateProductoDTO, CreateVentaDTO } from "./types";

/**
 * Mapea un producto que viene del backend al formato del frontend
 */
export function mapProductoFromApi(data: any): Producto {
  return {
    id_producto_pk: data.id_producto_pk,
    nombre_producto: data.nombre_producto,
    precio_producto: Number(data.precio_producto ?? 0),
    descripcion_producto: data.descripcion_producto ?? "",
    delete_at: data.delete_at ?? null,
  };
}

/**
 * Mapea un producto desde el frontend al formato que espera el backend
 */
export function mapProductoToApi(producto: CreateProductoDTO) {
  return {
    nombre_producto: producto.nombre_producto,
    precio_producto: producto.precio_producto,
    descripcion_producto: producto.descripcion_producto ?? "",
  };
}

/**
 * Mapea un detalle de venta que viene del backend al formato del frontend
 */
export function mapVentaDetalleFromApi(data: any): VentaDetalle {
  return {
    id_venta_detalle_pk: data.id_venta_detalle_pk,
    id_venta_fk: data.id_venta_fk,
    id_producto_fk: data.id_producto_fk,
    cantidad: Number(data.cantidad ?? 0),
    precio_unitario: Number(data.precio_unitario ?? 0),
    subtotal: Number(data.subtotal ?? 0),
    producto: data.producto ? mapProductoFromApi(data.producto) : undefined,
  };
}

/**
 * Mapea una venta que viene del backend al formato del frontend
 */
export function mapVentaFromApi(data: any): Venta {
  return {
    id_venta_pk: data.id_venta_pk,
    fecha_venta: data.fecha_venta,
    cliente_venta: data.cliente_venta,
    id_cultivo_fk: data.id_cultivo_fk ?? undefined,
    total_venta: Number(data.total_venta ?? 0),
    detalles: Array.isArray(data.detalles)
      ? data.detalles.map(mapVentaDetalleFromApi)
      : [],
    delete_at: data.delete_at ?? null,
  };
}

/**
 * Mapea una venta desde el frontend al formato que espera el backend
 */
export function mapVentaToApi(venta: CreateVentaDTO) {
  return {
    fecha_venta: venta.fecha_venta,
    cliente_venta: venta.cliente_venta,
    id_cultivo_fk: venta.id_cultivo_fk ?? null,
    detalles: venta.detalles.map(detalle => ({
      id_producto_fk: detalle.id_producto_fk,
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
    })),
  };
}