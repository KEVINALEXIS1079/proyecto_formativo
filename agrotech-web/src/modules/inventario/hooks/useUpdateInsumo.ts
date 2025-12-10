import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInsumo, getInsumo } from "../api/insumos.service";
import type { UpdateInsumoInput, Insumo, MovimientoInventario } from "../model/types";
import { QK_INSUMOS_LIST } from "./useInsumoList";
import { QK_INSUMO_BY_ID } from "./useInsumoById";
import { QK_MOVIMIENTOS_LIST } from "./useMovimientoList";
import { addMovimientoTemp } from "./useMovimientoList";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export function useUpdateInsumo() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateInsumoInput }) => {
      try {
        // Obtener el insumo actual antes de la actualización
        const insumoAnterior = await getInsumo(id);
        console.log('=== ACTUALIZANDO INSUMO ===');
        console.log('Insumo antes de actualizar:', {
          id: insumoAnterior.id,
          nombre: insumoAnterior.nombre,
          almacenId: insumoAnterior.almacen?.id,
          almacenNombre: insumoAnterior.almacen?.nombre,
          cambiosEnviados: payload
        });
        
        // Realizar la actualización
        const result = await updateInsumo(id, payload);
        console.log('Actualización completada:', result);
        
        // Obtener el insumo actualizado para comparar
        const insumoActualizado = await getInsumo(id);
        console.log('Insumo después de actualizar:', {
          id: insumoActualizado.id,
          nombre: insumoActualizado.nombre,
          almacenId: insumoActualizado.almacen?.id,
          almacenNombre: insumoActualizado.almacen?.nombre,
          resultadoApi: result
        });
        console.log('=== DETECTANDO CAMBIOS ===');
        
        // Mostrar alerta de éxito al usuario
        alert('¡Insumo actualizado correctamente!');
        
        // Generar movimiento automático si hay cambios relevantes
        const cambios = detectarCambios(insumoAnterior, insumoActualizado);
        if (cambios.length > 0 && user?.id) {
          // Crear movimiento inmediatamente en almacenamiento local
          const descripcionCambios = `Edición de insumo - Campos modificados: ${cambios.join(', ')}`;
          
          const tempMovimiento: MovimientoInventario = {
            id: Date.now(), // ID temporal único basado en timestamp
            tipoMovimiento: 'AJUSTE',
            cantidadPresentaciones: 0,
            cantidadBase: 0,
            valorMovimiento: 0,
            descripcion: descripcionCambios,
            fechaMovimiento: new Date().toISOString(),
            origen: 'EDITAR_INSUMO',
            usuarioResponsable: {
              id: user.id,
              nombre: user.nombre || 'Usuario',
              nombreUsuario: user.nombre || 'user'
            },
            insumo: {
              ...insumoActualizado
            }
          };
          
          // Guardar en almacenamiento local inmediatamente
          addMovimientoTemp(tempMovimiento);
          console.log('✅ Movimiento guardado en almacenamiento local:', tempMovimiento);
          
          // Invalidar queries de movimientos para mostrar el nuevo movimiento inmediatamente
          qc.invalidateQueries({ queryKey: QK_MOVIMIENTOS_LIST, exact: false });
        }
        
        return result;
      } catch (error) {
        // Solo mostrar error si falla la actualización del insumo
        console.error('Error al actualizar insumo:', error);
        alert('Error al actualizar el insumo. Por favor, intenta nuevamente.');
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      console.log('Invalidando queries después de actualizar insumo ID:', id);
      
      // Invalidar todas las queries de insumos (tanto con como sin parámetros)
      qc.invalidateQueries({ queryKey: QK_INSUMOS_LIST, exact: false });
      qc.invalidateQueries({ queryKey: [...QK_INSUMO_BY_ID, id] });
    },
  });
}

// Función auxiliar para detectar cambios entre insumo anterior y actualizado
function detectarCambios(anterior: Insumo, actual: Insumo): string[] {
  const cambios: string[] = [];
  
  // Campos básicos
  if (anterior.nombre !== actual.nombre) {
    cambios.push(`Nombre: "${anterior.nombre}" → "${actual.nombre}"`);
  }
  
  if (anterior.descripcion !== actual.descripcion) {
    cambios.push(`Descripción: "${anterior.descripcion || 'Sin descripción'}" → "${actual.descripcion || 'Sin descripción'}"`);
  }
  
  // Campos de stock
  if (anterior.stockPresentaciones !== actual.stockPresentaciones) {
    cambios.push(`Stock Presentaciones: ${anterior.stockPresentaciones} → ${actual.stockPresentaciones}`);
  }
  
  if (anterior.stockTotalBase !== actual.stockTotalBase) {
    cambios.push(`Stock Total Base: ${anterior.stockTotalBase} → ${actual.stockTotalBase}`);
  }
  
  // Precios
  if (anterior.precioUnitarioPresentacion !== actual.precioUnitarioPresentacion) {
    cambios.push(`Precio Unitario: ${anterior.precioUnitarioPresentacion.toLocaleString()} → ${actual.precioUnitarioPresentacion.toLocaleString()}`);
  }
  
  if (anterior.precioTotal !== actual.precioTotal) {
    cambios.push(`Precio Total: ${anterior.precioTotal.toLocaleString()} → ${actual.precioTotal.toLocaleString()}`);
  }
  
  // Campos de presentación
  if (anterior.presentacionTipo !== actual.presentacionTipo) {
    cambios.push(`Tipo Presentación: ${anterior.presentacionTipo} → ${actual.presentacionTipo}`);
  }
  
  if (anterior.presentacionCantidad !== actual.presentacionCantidad) {
    cambios.push(`Cantidad Presentación: ${anterior.presentacionCantidad} → ${actual.presentacionCantidad}`);
  }
  
  if (anterior.presentacionUnidad !== actual.presentacionUnidad) {
    cambios.push(`Unidad Presentación: ${anterior.presentacionUnidad} → ${actual.presentacionUnidad}`);
  }
  
  if (anterior.factorConversion !== actual.factorConversion) {
    cambios.push(`Factor Conversión: ${anterior.factorConversion} → ${actual.factorConversion}`);
  }
  
  // Campos relacionados - los más importantes para generar movimiento
  if (anterior.categoria?.nombre !== actual.categoria?.nombre) {
    cambios.push(`Categoría: ${anterior.categoria?.nombre || 'N/A'} → ${actual.categoria?.nombre || 'N/A'}`);
  }
  
  if (anterior.proveedor?.nombre !== actual.proveedor?.nombre) {
    cambios.push(`Proveedor: ${anterior.proveedor?.nombre || 'N/A'} → ${actual.proveedor?.nombre || 'N/A'}`);
  }
  
  // CAMBIO CRÍTICO: Almacén
  if (anterior.almacen?.nombre !== actual.almacen?.nombre || anterior.almacen?.id !== actual.almacen?.id) {
    cambios.push(`TRASLADO DE ALMACÉN: ${anterior.almacen?.nombre || 'N/A'} (ID: ${anterior.almacen?.id || 'N/A'}) → ${actual.almacen?.nombre || 'N/A'} (ID: ${actual.almacen?.id || 'N/A'})`);
  }
  
  return cambios;
}