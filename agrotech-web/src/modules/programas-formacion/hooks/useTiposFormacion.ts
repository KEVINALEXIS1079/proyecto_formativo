import { useQuery } from '@tanstack/react-query';
import { tiposFormacionApi } from '../api/tipos-formacion.api';

export function useTiposFormacion() {
    return useQuery({
        queryKey: ['tipos-formacion'],
        queryFn: () => tiposFormacionApi.getAll(),
        staleTime: 1000 * 60 * 60, // 1 hour - tipos don't change often
    });
}
