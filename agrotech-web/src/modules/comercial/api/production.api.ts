import { api } from '@/shared/api/client';
import type {
    ProductoAgro,
    LoteProduccion,
    CreateProductoAgroDto,
    CreateLoteProduccionDto,
    UpdateLoteProduccionDto
} from '../models/types/production.types';

// ==================== PRODUCTO AGRO ====================

export const getProductos = async (): Promise<ProductoAgro[]> => {
    const { data } = await api.get<ProductoAgro[]>('/production/productos');
    return data;
};

export const createProducto = async (dto: CreateProductoAgroDto): Promise<ProductoAgro> => {
    const { data } = await api.post<ProductoAgro>('/production/productos', dto);
    return data;
};

// ==================== LOTES PRODUCCION ====================

export const getLotesProduccion = async (filters?: { productoAgroId?: number; cultivoId?: number }): Promise<LoteProduccion[]> => {
    const { data } = await api.get<LoteProduccion[]>('/production/lotes-produccion', { params: filters });
    return data;
};

export const getLoteProduccionById = async (id: number): Promise<LoteProduccion> => {
    const { data } = await api.get<LoteProduccion>(`/production/lotes-produccion/${id}`);
    return data;
};

export const createLoteProduccion = async (dto: CreateLoteProduccionDto): Promise<LoteProduccion> => {
    const { data } = await api.post<LoteProduccion>('/production/lotes-produccion', dto);
    return data;
};

export const updateLoteProduccion = async (id: number, dto: UpdateLoteProduccionDto): Promise<LoteProduccion> => {
    const { data } = await api.patch<LoteProduccion>(`/production/lotes-produccion/${id}`, dto);
    return data;
};

export const deleteLoteProduccion = async (id: number): Promise<void> => {
    await api.delete(`/production/lotes-produccion/${id}`);
};
