import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { inventarioService } from "../api/inventario.service";
import { QK_INSUMOS_LIST } from "./useInsumoList";

export function useInventarioRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Eventos de insumos
    inventarioService.onCreated((insumo: any) => {
      // Invalidar y refetch de listas de insumos
      queryClient.invalidateQueries({ queryKey: QK_INSUMOS_LIST });
    });

    inventarioService.onUpdated((insumo: any) => {
      // Invalidar y refetch de listas de insumos
      queryClient.invalidateQueries({ queryKey: QK_INSUMOS_LIST });
      // También invalidar query específica del insumo si existe
      queryClient.invalidateQueries({ queryKey: ["inventario", "insumos", insumo.id_insumo_pk] });
    });

    inventarioService.onDeleted(({ id_insumo_pk }: { id_insumo_pk: number }) => {
      // Invalidar listas de insumos
      queryClient.invalidateQueries({ queryKey: QK_INSUMOS_LIST });
      // Remover del cache la query específica
      queryClient.removeQueries({ queryKey: ["inventario", "insumos", id_insumo_pk] });
    });

    inventarioService.onRestored((insumo: any) => {
      // Invalidar y refetch de listas de insumos
      queryClient.invalidateQueries({ queryKey: QK_INSUMOS_LIST });
      // También invalidar query específica del insumo si existe
      queryClient.invalidateQueries({ queryKey: ["inventario", "insumos", insumo.id_insumo_pk] });
    });

    // Eventos de movimientos
    inventarioService.on("movimientos:created", (movimiento: any) => {
      // Invalidar listas de movimientos
      queryClient.invalidateQueries({ queryKey: ["inventario", "movimientos", "list"] });
    });

    inventarioService.on("movimientos:updated", (movimiento: any) => {
      // Invalidar listas de movimientos
      queryClient.invalidateQueries({ queryKey: ["inventario", "movimientos", "list"] });
      // Invalidar query específica del movimiento
      queryClient.invalidateQueries({ queryKey: ["inventario", "movimientos", movimiento.id_movimiento_inventario_pk] });
    });

    inventarioService.on("movimientos:removed", ({ id_movimiento_inventario_pk }: { id_movimiento_inventario_pk: number }) => {
      // Invalidar listas de movimientos
      queryClient.invalidateQueries({ queryKey: ["inventario", "movimientos", "list"] });
      // Remover del cache la query específica
      queryClient.removeQueries({ queryKey: ["inventario", "movimientos", id_movimiento_inventario_pk] });
    });

    // Cleanup
    return () => {
      inventarioService.offCreated();
      inventarioService.offUpdated();
      inventarioService.offDeleted();
      inventarioService.offRestored();
    };
  }, [queryClient]);
}