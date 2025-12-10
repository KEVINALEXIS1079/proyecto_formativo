import { useQuery } from "@tanstack/react-query";
import { listMovimientos } from "../api/movimientos.service";
import type { MovimientoInventario } from "../model/types";

export const QK_MOVIMIENTOS_LIST = ["inventario", "movimientos", "list"] as const;

// Sistema de almacenamiento local temporal para movimientos
const STORAGE_KEY = 'agrotech_movimientos_temp';

interface MovimientosTempStorage {
  movimientos: MovimientoInventario[];
  lastUpdated: string;
}

function getMovimientosFromStorage(): MovimientoInventario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const data: MovimientosTempStorage = JSON.parse(stored);
    return data.movimientos || [];
  } catch (error) {
    console.log('Error reading movimientos from storage:', error);
    return [];
  }
}

function saveMovimientosToStorage(movimientos: MovimientoInventario[]): void {
  try {
    const data: MovimientosTempStorage = {
      movimientos,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.log('Error saving movimientos to storage:', error);
  }
}

function addMovimientoToStorage(movimiento: MovimientoInventario): void {
  const movimientos = getMovimientosFromStorage();
  movimientos.unshift(movimiento); // Agregar al inicio
  saveMovimientosToStorage(movimientos.slice(0, 1000)); // Mantener solo los últimos 1000
}

function filterMovimientosLocal(movimientos: MovimientoInventario[], params?: { page?: number; limit?: number; q?: string; idInsumo?: number; tipoMovimiento?: string; fechaDesde?: string; fechaHasta?: string }): MovimientoInventario[] {
  let filtered = [...movimientos];
  
  if (params?.q) {
    const searchTerm = params.q.toLowerCase();
    filtered = filtered.filter(m => 
      m.descripcion.toLowerCase().includes(searchTerm) ||
      m.insumo?.nombre?.toLowerCase().includes(searchTerm) ||
      m.tipoMovimiento.toLowerCase().includes(searchTerm)
    );
  }
  
  if (params?.idInsumo) {
    filtered = filtered.filter(m => m.insumo?.id === params.idInsumo);
  }
  
  if (params?.tipoMovimiento) {
    filtered = filtered.filter(m => m.tipoMovimiento === params.tipoMovimiento);
  }
  
  if (params?.fechaDesde) {
    const fechaDesde = new Date(params.fechaDesde);
    filtered = filtered.filter(m => new Date(m.fechaMovimiento) >= fechaDesde);
  }
  
  if (params?.fechaHasta) {
    const fechaHasta = new Date(params.fechaHasta);
    filtered = filtered.filter(m => new Date(m.fechaMovimiento) <= fechaHasta);
  }
  
  // Paginación
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return filtered.slice(startIndex, endIndex);
}

export function useMovimientoList(params?: { page?: number; limit?: number; q?: string; idInsumo?: number; tipoMovimiento?: string; fechaDesde?: string; fechaHasta?: string }) {
  return useQuery({
    queryKey: [...QK_MOVIMIENTOS_LIST, params],
    queryFn: async () => {
      console.log('Fetching movimientos with params:', params);
      
      let backendMovimientos: MovimientoInventario[] = [];
      const localMovimientos = getMovimientosFromStorage();
      
      try {
        // Intentar obtener movimientos del backend
        console.log('Attempting to fetch movimientos from backend...');
        backendMovimientos = await listMovimientos(params);
        console.log('✅ Backend movimientos retrieved successfully:', backendMovimientos.length);
      } catch (error) {
        console.warn('⚠️ Backend not available, falling back to local storage:', error);
        // Si el backend falla, usar localStorage como fallback
        backendMovimientos = [];
      }
      
      // Combinar movimientos del backend con los locales
      // Eliminar duplicados por ID (los locales tienen IDs de timestamp)
      const combinedMovimientos = [...backendMovimientos];
      
      // Agregar movimientos locales que no estén en el backend
      localMovimientos.forEach(localMov => {
        const existsInBackend = backendMovimientos.some(backendMov => 
          backendMov.id === localMov.id || 
          (localMov.id > 0 && backendMov.id === localMov.id)
        );
        if (!existsInBackend) {
          combinedMovimientos.unshift(localMov); // Agregar al inicio
        }
      });
      
      // Aplicar filtros a los movimientos combinados
      const filtered = filterMovimientosLocal(combinedMovimientos, params);
      
      console.log('📊 Final movimientos summary:');
      console.log('- Backend movimientos:', backendMovimientos.length);
      console.log('- Local movimientos:', localMovimientos.length);
      console.log('- Combined total:', combinedMovimientos.length);
      console.log('- After filtering:', filtered.length);
      
      return filtered;
    },
    staleTime: 15_000,
    enabled: true,
    retry: 3, // Reintentar 3 veces en caso de fallo
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

// Función para agregar movimiento al almacenamiento local
export function addMovimientoTemp(movimiento: MovimientoInventario): void {
  addMovimientoToStorage(movimiento);
}

// Función para limpiar almacenamiento local
export function clearMovimientosTemp(): void {
  localStorage.removeItem(STORAGE_KEY);
}