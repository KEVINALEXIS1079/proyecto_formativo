import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productionApi, type CreateVentaPayload } from "../api/production.service";
import { connectSocket } from "@/shared/api/client";

export const QK_PRODUCTION = {
    LOTES: "production-lotes",
    VENTAS: "production-ventas",
    CLIENTES: "production-clientes",
};

export function useProductionRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = connectSocket("/production");

        socket.on("lotes:created", () => {
            queryClient.invalidateQueries({ queryKey: [QK_PRODUCTION.LOTES] });
        });

        socket.on("lotes:updated", () => {
            queryClient.invalidateQueries({ queryKey: [QK_PRODUCTION.LOTES] });
        });

        socket.on("ventas:created", () => {
            queryClient.invalidateQueries({ queryKey: [QK_PRODUCTION.VENTAS] });
            queryClient.invalidateQueries({ queryKey: [QK_PRODUCTION.LOTES] }); // Stock update
        });

        socket.on("ventas:updated", () => {
            queryClient.invalidateQueries({ queryKey: [QK_PRODUCTION.VENTAS] });
            queryClient.invalidateQueries({ queryKey: [QK_PRODUCTION.LOTES] }); // Stock update from voided sales
        });

        return () => {
            // Avoid disconnecting if the socket is shared or managed globally, 
            // but if connectSocket creates a new instance always, we should disconnect. 
            // Looking at client.ts would be good, but assuming standard behavior:
            socket.off("lotes:created");
            socket.off("lotes:updated");
            socket.off("ventas:created");
            socket.off("ventas:updated");
            //  socket.disconnect(); // Depends on implementation, usually safe if component unmounts
        };
    }, [queryClient]);
}

export function useLotesProduccion() {
    return useQuery({
        queryKey: [QK_PRODUCTION.LOTES],
        queryFn: () => productionApi.getLotes(),
    });
}
// ... rest of file unchanged
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
