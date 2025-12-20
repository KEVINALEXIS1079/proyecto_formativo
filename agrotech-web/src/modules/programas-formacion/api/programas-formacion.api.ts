import api from '@/shared/api/client';
import type { User } from '@/modules/users/models/types/user.types';

export interface ProgramaFormacion {
    id: number;
    numeroFicha: string;
    nombre: string;
    tipo: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado: string;
    cantidadAprendices: number;
    usuarios?: User[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateProgramaFormacionDto {
    numeroFicha: string;
    nombre: string;
    tipo: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
}

export interface UpdateProgramaFormacionDto extends Partial<CreateProgramaFormacionDto> { }

export interface ProgramaFormacionFilters {
    tipo?: string;
    estado?: string;
    q?: string;
}

export const programasFormacionApi = {
    async getAll(filters?: ProgramaFormacionFilters): Promise<ProgramaFormacion[]> {
        const params = new URLSearchParams();
        if (filters?.tipo) params.append('tipo', filters.tipo);
        if (filters?.estado) params.append('estado', filters.estado);
        if (filters?.q) params.append('q', filters.q);

        const { data } = await api.get(`/programas-formacion?${params.toString()}`);
        return data;
    },

    async getOne(id: number): Promise<ProgramaFormacion> {
        const { data } = await api.get(`/programas-formacion/${id}`);
        return data;
    },

    async create(dto: CreateProgramaFormacionDto): Promise<ProgramaFormacion> {
        const { data } = await api.post('/programas-formacion', dto);
        return data;
    },

    async update(id: number, dto: UpdateProgramaFormacionDto): Promise<ProgramaFormacion> {
        const { data } = await api.patch(`/programas-formacion/${id}`, dto);
        return data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/programas-formacion/${id}`);
    },
};
