import type { Venta, CreateVentaDto } from "./types/sales.types";

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
