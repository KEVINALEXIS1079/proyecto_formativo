import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programasFormacionApi, type ProgramaFormacionFilters, type CreateProgramaFormacionDto, type UpdateProgramaFormacionDto } from '../api/programas-formacion.api';

export function useProgramasFormacion(filters?: ProgramaFormacionFilters) {
    return useQuery({
        queryKey: ['programas-formacion', filters],
        queryFn: () => programasFormacionApi.getAll(filters),
    });
}

export function useProgramaFormacion(id: number) {
    return useQuery({
        queryKey: ['programas-formacion', id],
        queryFn: () => programasFormacionApi.getOne(id),
        enabled: !!id,
    });
}

export function useCreateProgramaFormacion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateProgramaFormacionDto) => programasFormacionApi.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programas-formacion'] });
        },
    });
}

export function useUpdateProgramaFormacion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: UpdateProgramaFormacionDto }) =>
            programasFormacionApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programas-formacion'] });
        },
    });
}

export function useDeleteProgramaFormacion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => programasFormacionApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programas-formacion'] });
        },
    });
}
