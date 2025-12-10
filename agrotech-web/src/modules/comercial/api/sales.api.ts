import { api } from '@/shared/api/client';
import type {
    Venta,
    Cliente,
    CreateVentaDto,
    CreateClienteDto
} from '../models/types/sales.types';

// ==================== VENTAS ====================

export const getVentas = async (filters?: { clienteId?: number; fechaInicio?: Date; fechaFin?: Date }): Promise<Venta[]> => {
    const { data } = await api.get<Venta[]>('/production/ventas', { params: filters });
    return data;
};

export const getVentaById = async (id: number): Promise<Venta> => {
    const { data } = await api.get<Venta>(`/production/ventas/${id}`);
    return data;
};

export const createVenta = async (dto: CreateVentaDto): Promise<Venta> => {
    const { data } = await api.post<Venta>('/production/ventas', dto);
    return data;
};

export const anularVenta = async (id: number): Promise<Venta> => {
    const { data } = await api.post<Venta>(`/production/ventas/${id}/anular`);
    return data;
};

// ==================== CLIENTES ====================

export const getClientes = async (): Promise<Cliente[]> => {
    const { data } = await api.get<Cliente[]>('/production/clientes');
    return data;
};

export const createCliente = async (dto: CreateClienteDto): Promise<Cliente> => {
    const { data } = await api.post<Cliente>('/production/clientes', dto);
    return data;
};
