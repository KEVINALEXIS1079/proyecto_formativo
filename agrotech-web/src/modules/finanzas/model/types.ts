/* tipos UI del dominio */

export interface Producto {
  id_producto_pk: number;
  nombre_producto: string;
  precio_producto: number;
  descripcion_producto?: string;
  delete_at: string | null;
}

export interface VentaDetalle {
  id_venta_detalle_pk: number;
  id_venta_fk: number;
  id_producto_fk: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface Venta {
  id_venta_pk: number;
  fecha_venta: string;
  cliente_venta: string;
  id_cultivo_fk?: number;
  total_venta: number;
  detalles: VentaDetalle[];
  delete_at: string | null;
}

export interface CreateProductoDTO {
  nombre_producto: string;
  precio_producto: number;
  descripcion_producto?: string;
}

export interface CreateVentaDTO {
  fecha_venta: string;
  cliente_venta: string;
  id_cultivo_fk?: number;
  detalles: CreateVentaDetalleDTO[];
}

export interface CreateVentaDetalleDTO {
  id_producto_fk: number;
  cantidad: number;
  precio_unitario: number;
}

export interface VentaFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
  cliente?: string;
  id_cultivo?: number;
}