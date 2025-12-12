
export interface Cliente {
    id: number;
    nombre: string;
    identificacion?: string;
    telefono?: string;
    correo?: string;
}

export interface VentaDetalle {
    id: number;
    ventaId: number;
    loteProduccionId: number;
    cantidadKg: number;
    precioUnitarioKg: number;
    subtotal: number;
    loteProduccion?: any; // Replace with LoteProduccion type if imported, or keep loose
}

export interface Pago {
    id: number;
    ventaId: number;
    metodoPago: string;
    monto: number;
    fecha: Date;
}

export interface Venta {
    id: number;
    fecha: string; // Date string
    clienteId: number;
    subtotal: number;
    impuestos: number;
    descuento: number;
    total: number;
    estado: string;
    usuarioId: number;
    anuladaPorUsuarioId?: number;
    fechaAnulacion?: Date;
    cliente?: Cliente;
    detalles?: VentaDetalle[];
    pagos?: Pago[];
}

export interface CreateClienteDto {
    nombre: string;
    identificacion?: string;
    telefono?: string;
    correo?: string;
}

export interface CreateVentaDto {
    clienteId?: number;
    detalles: CreateVentaDetalleDTO[];
    pagos: Array<{
        metodoPago: string;
        monto: number;
    }>;
}

export interface CreateVentaDetalleDTO {
    loteProduccionId: number;
    id_producto_fk?: number;
    cantidad?: number; // For UI
    precio_unitario?: number; // For UI
    // Backend expects:
    cantidadKg: number;
    precioUnitarioKg: number;
}
