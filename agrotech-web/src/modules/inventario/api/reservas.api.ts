import { api } from '@/shared/api/client';
import type { Reserva, CreateReservaInput } from '../model/types';

export const reservasApi = {
    getAll: async (): Promise<Reserva[]> => {
        const response = await api.get<Reserva[]>('/reservas');
        return response.data;
    },

    create: async (data: CreateReservaInput): Promise<Reserva> => {
        const response = await api.post<Reserva>('/reservas', data);
        return response.data;
    },

    liberar: async (id: number): Promise<void> => {
        await api.patch(`/reservas/${id}/liberar`);
    },

    utilizar: async (id: number): Promise<void> => {
        await api.patch(`/reservas/${id}/utilizar`);
    },
};
