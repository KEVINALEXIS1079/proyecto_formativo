import type { Venta, CreateVentaDto } from "./types/sales.types";
import type { ProductoAgro, CreateProductoAgroDto } from "./types/production.types";

export function mapProductoFromApi(data: any): ProductoAgro {
    return {
        id: data.id,
        nombre: data.nombre,
        unidadBase: data.unidadBase,
        descripcion: data.descripcion,
        imagen: data.imagen || undefined
    };
}

export function mapProductoToApi(dto: CreateProductoAgroDto): any {
    return {
        nombre: dto.nombre,
        unidadBase: dto.unidadBase,
        descripcion: dto.descripcion
    };
}

export function mapVentaFromApi(data: any): Venta {
    return {
        ...data,
        fecha: data.fecha || new Date().toISOString(),
        // Ensure nested arrays are present
        detalles: data.detalles || [],
        pagos: data.pagos || [],
        cliente: data.cliente || undefined,
    };
}

export function mapVentaToApi(dto: CreateVentaDto): any {
    return {
        clienteId: dto.clienteId,
        detalles: dto.detalles.map(d => ({
            loteProduccionId: d.loteProduccionId,
            cantidadKg: d.cantidadKg,
            precioUnitarioKg: d.precioUnitarioKg
        })),
        pagos: dto.pagos.map(p => ({
            metodoPago: p.metodoPago,
            monto: p.monto
        }))
    };
}
