import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/production.api';
import type { CreateProductoAgroDto, CreateLoteProduccionDto, UpdateLoteProduccionDto } from '../models/types/production.types';
import { toast } from 'react-hot-toast';

export const useProductos = () => {
    return useQuery({
        queryKey: ['productos'],
        queryFn: api.getProductos,
    });
};

export const useCreateProducto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProductoAgroDto) => api.createProducto(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Producto creado correctamente');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear producto');
        }
    });
};

export const useLotesProduccion = (filters?: { productoAgroId?: number; cultivoId?: number }) => {
    return useQuery({
        queryKey: ['lotes-produccion', filters],
        queryFn: () => api.getLotesProduccion(filters),
    });
};

export const useLoteProduccion = (id: number) => {
    return useQuery({
        queryKey: ['lotes-produccion', id],
        queryFn: () => api.getLoteProduccionById(id),
        enabled: !!id,
    });
};

export const useCreateLoteProduccion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateLoteProduccionDto) => api.createLoteProduccion(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes-produccion'] });
            toast.success('Lote de producción creado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al crear lote');
        }
    });
};

export const useUpdateLoteProduccion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateLoteProduccionDto }) => api.updateLoteProduccion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes-produccion'] });
            toast.success('Lote actualizado');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Error al actualizar lote');
        }
    });
};
