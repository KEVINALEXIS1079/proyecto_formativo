import api from '@/shared/api/client';

export interface TipoFormacion {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    orden: number;
}

export const tiposFormacionApi = {
    async getAll(): Promise<TipoFormacion[]> {
        const { data } = await api.get('/programas-formacion/tipos');
        return data;
    },
};
