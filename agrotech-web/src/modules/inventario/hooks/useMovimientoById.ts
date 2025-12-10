import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import { adaptMovimiento } from "../model/mappers";
import type { MovimientoInventario } from "../model/types";

export const QK_MOVIMIENTO_BY_ID = ["inventario", "movimiento"] as const;

// Función para obtener movimiento desde localStorage
function getMovimientoFromLocalStorage(id: number): MovimientoInventario | undefined {
  try {
    const stored = localStorage.getItem('agrotech_movimientos_temp');
    if (!stored) return undefined;

    const data = JSON.parse(stored);
    const movimientos = data.movimientos || [];

    // Buscar el movimiento por ID
    const movimiento = movimientos.find((m: MovimientoInventario) => m.id === id);
    return movimiento;
  } catch (error) {
    console.log('Error reading movimiento from localStorage:', error);
    return undefined;
  }
}

export function useMovimientoById(id: number) {
  return useQuery({
    queryKey: [...QK_MOVIMIENTO_BY_ID, id],
    queryFn: async () => {
      // Primero buscar en localStorage
      const movimientoLocal = getMovimientoFromLocalStorage(id);
      if (movimientoLocal) {
        return movimientoLocal;
      }

      // Si no está en localStorage, buscar en el backend
      try {
        const { data } = await api.get(`/insumos/movimientos/${id}`);
        return adaptMovimiento(data);
      } catch (error) {
        console.error('Error fetching movimiento from backend:', error);
        throw new Error(`Movimiento con ID ${id} no encontrado`);
      }
    },
    enabled: !!id,
    staleTime: 15_000,
    retry: false, // No reintentar si el movimiento no existe
  });
}