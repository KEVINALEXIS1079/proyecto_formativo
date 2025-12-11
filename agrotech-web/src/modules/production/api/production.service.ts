import { api } from "@/shared/api/client";

export interface ProductoAgro {
    id: number;
    nombre: string;
    codigo?: string;
    unidadMedida: string;
}

export interface LoteProduccion {
    id: number;
    codigoLote?: string;
    cultivoId?: number;
    cultivo?: { nombre: string; lote?: { nombre: string } };
    productoAgroId: number;
    productoAgro?: ProductoAgro;
    stockDisponibleKg: number;
    costoUnitarioKg: number;
    precioSugeridoKg: number;
    fechaExpiracion?: string;
    calidad?: string;
}

export interface Cliente {
    id: number;
    nombre: string;
    identificacion?: string;
    telefono?: string;
    correo?: string;
}

export interface VentaDetalle {
    id: number;
    loteProduccionId: number;
    loteProduccion?: LoteProduccion;
    cantidadKg: number;
    precioUnitarioKg: number;
    subtotal: number;
}

export interface Venta {
    id: number;
    clienteId?: number;
    cliente?: Cliente;
    fecha: string;
    subtotal: number;
    impuestos: number;
    total: number;
    estado: string; // 'completada' | 'anulada'
    detalles: VentaDetalle[];
}

export interface CreateVentaPayload {
    clienteId?: number;
    detalles: {
        loteProduccionId: number;
        cantidadKg: number;
        precioUnitarioKg: number;
    }[];
    pagos: {
        metodoPago: string; // 'efectivo' | 'transferencia'
        monto: number;
    }[];
    usuarioId: number;
}

export const productionApi = {
    // Lotes (Inventory)
    getLotes: async (params?: { productoAgroId?: number; cultivoId?: number }) => {
        const { data } = await api.get<LoteProduccion[]>("/production/lotes", { params });
        return data;
    },

    // Sales (POS)
    createVenta: async (payload: CreateVentaPayload) => {
        const { data } = await api.post<Venta>("/production/ventas", payload);
        return data;
    },

    getVentas: async (params?: { clienteId?: number; start?: Date; end?: Date }) => {
        const { data } = await api.get<Venta[]>("/production/ventas", { params });
        return data;
    },

    anularVenta: async (id: number) => {
        const { data } = await api.post<Venta>(`/production/ventas/${id}/anular`);
        return data;
    },

    // Clients
    getClientes: async () => {
        const { data } = await api.get<Cliente[]>("/production/clientes");
        return data;
    },

    createCliente: async (payload: { nombre: string; identificacion?: string; telefono?: string }) => {
        const { data } = await api.post<Cliente>("/production/clientes", payload);
        return data;
    },
};
