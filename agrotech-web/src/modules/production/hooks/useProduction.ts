import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productionApi, type CreateVentaPayload } from "../api/production.service";

export const QK_PRODUCTION = {
    LOTES: "production-lotes",
    VENTAS: "production-ventas",
    CLIENTES: "production-clientes",
};

export function useLotesProduccion() {
    return useQuery({
        queryKey: [QK_PRODUCTION.LOTES],
        queryFn: () => productionApi.getLotes(),
    });
}

export function useClientes() {
    return useQuery({
        queryKey: [QK_PRODUCTION.CLIENTES],
        queryFn: () => productionApi.getClientes(),
    });
}

export function useCreateCliente() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: productionApi.createCliente,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [QK_PRODUCTION.CLIENTES] });
        },
    });
}

export function useVentas() {
    return useQuery({
        queryKey: [QK_PRODUCTION.VENTAS],
        queryFn: () => productionApi.getVentas(),
    });
}

export function useCreateVenta() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateVentaPayload) => productionApi.createVenta(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [QK_PRODUCTION.VENTAS] });
            qc.invalidateQueries({ queryKey: [QK_PRODUCTION.LOTES] }); // Stock deduction
        },
    });
}

export function useAnularVenta() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: productionApi.anularVenta,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [QK_PRODUCTION.VENTAS] });
            qc.invalidateQueries({ queryKey: [QK_PRODUCTION.LOTES] }); // Stock return
        },
    });
}
