import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/sales.api';
import type { CreateVentaDto, CreateClienteDto } from '../models/types/sales.types';
import { toast } from 'react-hot-toast';

export const useVentas = (filters?: { clienteId?: number; fechaInicio?: Date; fechaFin?: Date }) => {
    return useQuery({
        queryKey: ['ventas', filters],
        queryFn: () => api.getVentas(filters),
    });
};

export const useVenta = (id: number) => {
    return useQuery({
        queryKey: ['ventas', id],
        queryFn: () => api.getVentaById(id),
        enabled: !!id,
    });
};

export const useCreateVenta = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateVentaDto) => api.createVenta(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ventas'] });
            // Also invalidate production lotes as stock changes
            queryClient.invalidateQueries({ queryKey: ['lotes-produccion'] });
            toast.success('Venta registrada correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al registrar venta');
        }
    });
};

export const useAnularVenta = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.anularVenta(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ventas'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-produccion'] });
            toast.success('Venta anulada correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al anular venta');
        }
    });
};

export const useClientes = () => {
    return useQuery({
        queryKey: ['clientes'],
        queryFn: api.getClientes,
    });
};

export const useCreateCliente = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateClienteDto) => api.createCliente(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            toast.success('Cliente registrado correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al registrar cliente');
        }
    });
};
