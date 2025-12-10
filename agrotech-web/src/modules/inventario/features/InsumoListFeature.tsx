import { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useInsumoList } from '../hooks/useInsumoList';
import { useInsumoById } from '../hooks/useInsumoById';
import { useCreateInsumo } from '../hooks/useCreateInsumo';
import { useUpdateInsumo } from '../hooks/useUpdateInsumo';
import { useRemoveInsumo } from '../hooks/useRemoveInsumo';
import { useMovimientoList } from '../hooks/useMovimientoList';
import { QK_HAS_MOVIMIENTOS } from '../hooks/useHasMovimientos';
import { hasMovimientos } from '../api/insumos.service';
import { InsumoTable } from '../widgets/InsumoTable';
import { InsumoForm } from '../widgets/InsumoForm';
import { InsumoFilters } from '../widgets/InsumoFilters';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Image } from "@heroui/image";
import type { Insumo, InsumoFilters as InsumoFiltersType } from '../model/types';

const FILES_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace('/api/v1', '');

export interface InsumoListRef {
  openCreateModal: () => void;
}

export const InsumoListFeature = forwardRef<InsumoListRef>((_, ref) => {
  const [filters, setFilters] = useState<InsumoFiltersType>({});
  const { data: insumoResponse, isLoading, refetch } = useInsumoList(filters);
  const createInsumoMutation = useCreateInsumo();
  const updateInsumoMutation = useUpdateInsumo();
  const removeInsumoMutation = useRemoveInsumo();

  const insumos = insumoResponse?.items ?? [];

  const hasMovimientosQueries = useQueries({
    queries: insumos.map(insumo => ({
      queryKey: [...QK_HAS_MOVIMIENTOS, insumo.id],
      queryFn: () => hasMovimientos(insumo.id),
      enabled: !!insumo.id,
      staleTime: 15_000,
    }))
  });

  const hasMovimientosMap = useMemo(() => {
    const map = new Map<number, boolean>();
    hasMovimientosQueries.forEach((query, index) => {
      const insumo = insumos[index];
      if (insumo) {
        map.set(insumo.id, query.data ?? false);
      }
    });
    return map;
  }, [hasMovimientosQueries, insumos]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMovimientosModalOpen, setIsMovimientosModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | undefined>(undefined);
  const [insumoToDelete, setInsumoToDelete] = useState<Insumo | undefined>(undefined);
  const [selectedInsumoForMovimientos, setSelectedInsumoForMovimientos] = useState<number | null>(null);
  const [selectedInsumoForView, setSelectedInsumoForView] = useState<number | null>(null);

  const { data: movimientos = [], isLoading: isLoadingMovimientos } = useMovimientoList(
    selectedInsumoForMovimientos ? { idInsumo: selectedInsumoForMovimientos } : undefined
  );

  const { data: insumoView } = useInsumoById(selectedInsumoForView || 0);

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setSelectedInsumo(undefined);
      setIsModalOpen(true);
    },
  }));

  // Edit disabled
  // const handleEdit = (insumo: Insumo) => {
  //   setSelectedInsumo(insumo);
  //   setIsModalOpen(true);
  // };

  const handleDelete = (insumo: Insumo) => {
    setInsumoToDelete(insumo);
    setIsDeleteModalOpen(true);
  };

  const handleViewMovimientos = (insumo: Insumo) => {
    setSelectedInsumoForMovimientos(insumo.id);
    setIsMovimientosModalOpen(true);
  };

  const handleView = (insumo: Insumo) => {
    setSelectedInsumoForView(insumo.id);
    setIsViewModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (insumoToDelete) {
      try {
        await removeInsumoMutation.mutateAsync({
          id: insumoToDelete.id,
          payload: { descripcion: "Eliminación desde lista de inventario" }
        });
        setIsDeleteModalOpen(false);
        setInsumoToDelete(undefined);
      } catch (error) {
        console.error('Error deleting insumo:', error);
        alert('Error al eliminar el insumo. Verifique la consola para más detalles.');
      }
    }
  };


  const handleFormSubmit = async (data: any): Promise<{ id?: number }> => {
    try {
      if (selectedInsumo) {
        // Update
        await updateInsumoMutation.mutateAsync({
          id: selectedInsumo.id,
          payload: data
        });
        refetch();
        return {};
      } else {
        // Create
        const result = await createInsumoMutation.mutateAsync(data);
        refetch();
        return { id: result.id };
      }
    } catch (error) {
      console.error('Error saving insumo:', error);
      alert('Error al guardar el insumo. Verifique la consola para más detalles.');
      throw error;
    }
  };

  return (
    <div className="flex flex-col">
      <InsumoFilters filters={filters} onChange={setFilters} />

      <InsumoTable
        insumos={insumos}
        isLoading={isLoading}
        onView={handleView}
        onDelete={handleDelete}
        onViewMovimientos={handleViewMovimientos}
        hasMovimientosMap={hasMovimientosMap}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setSelectedInsumo(undefined);
          }
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            {selectedInsumo ? `Editar Insumo: ${selectedInsumo.nombre}` : 'Nuevo Insumo'}
          </ModalHeader>
          <ModalBody>
            <InsumoForm
              insumo={selectedInsumo}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedInsumo(undefined);
              }}
              onSuccess={handleFormSubmit}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Eliminar Insumo</ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600">
              ¿Estás seguro de eliminar el insumo <strong>"{insumoToDelete?.nombre}"</strong>?
              Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <div className="flex justify-end gap-3 p-6 pt-0">
            <Button
              variant="flat"
              onPress={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
              isLoading={removeInsumoMutation.isPending}
            >
              Eliminar
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* Movimientos Modal */}
      <Modal
        isOpen={isMovimientosModalOpen}
        onOpenChange={setIsMovimientosModalOpen}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader>Historial de Movimientos</ModalHeader>
          <ModalBody>
            {isLoadingMovimientos ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Cargando movimientos...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table aria-label="Tabla de movimientos">
                  <TableHeader>
                    <TableColumn>Tipo</TableColumn>
                    <TableColumn>Cantidad Presentación</TableColumn>
                    <TableColumn>Cantidad Base</TableColumn>
                    <TableColumn>Valor Movimiento</TableColumn>
                    <TableColumn>Fecha</TableColumn>
                    <TableColumn>Descripción</TableColumn>
                  </TableHeader>
                  <TableBody items={movimientos} emptyContent="No hay movimientos">
                    {(item) => (
                      <TableRow key={item.id.toString()}>
                        <TableCell>{item.tipoMovimiento}</TableCell>
                        <TableCell>{item.cantidadPresentaciones}</TableCell>
                        <TableCell>{item.cantidadBase}</TableCell>
                        <TableCell>${item.valorMovimiento}</TableCell>
                        <TableCell>{new Date(item.fechaMovimiento).toLocaleDateString('es-CO')}</TableCell>
                        <TableCell>{item.descripcion}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Detalles del Insumo</ModalHeader>
          <ModalBody>
            {insumoView && (
              <div className="space-y-6">
                {/* Imagen */}
                <div className="flex justify-center">
                  {insumoView.imagenUrl ? (
                    <Image
                      src={
                        /^(data:|blob:|https?:\/\/)/i.test(insumoView.imagenUrl)
                          ? insumoView.imagenUrl
                          : `${FILES_BASE.replace(/\/+$/, "")}/${insumoView.imagenUrl.replace(/^\/+/, "")}`
                      }
                      alt={insumoView.nombre}
                      width={200}
                      height={200}
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Información General</h3>
                    <div className="space-y-2">
                      <p><strong>ID:</strong> {insumoView.id}</p>
                      <p><strong>Nombre:</strong> {insumoView.nombre}</p>
                      <p><strong>Descripción:</strong> {insumoView.descripcion || 'N/A'}</p>
                      <p><strong>Tipo de Materia:</strong> {insumoView.tipoMateria}</p>
                      <p><strong>Fecha de Ingreso:</strong> {new Date(insumoView.fechaIngreso).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Presentación</h3>
                    <div className="space-y-2">
                      <p><strong>Tipo:</strong> {insumoView.presentacionTipo}</p>
                      <p><strong>Cantidad:</strong> {insumoView.presentacionCantidad} {insumoView.presentacionUnidad}</p>
                      <p><strong>Unidad Base:</strong> {insumoView.unidadBase}</p>
                      <p><strong>Factor de Conversión:</strong> {insumoView.factorConversion}</p>
                    </div>
                  </div>
                </div>

                {/* Stock y precios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Stock</h3>
                    <div className="space-y-2">
                      <p><strong>Stock Presentaciones:</strong> {insumoView.stockPresentaciones}</p>
                      <p><strong>Stock Total Base:</strong> {insumoView.stockTotalBase} {insumoView.unidadBase}</p>
                      <p><strong>Stock Total Presentación:</strong> {insumoView.stockTotalPresentacion}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Precios</h3>
                    <div className="space-y-2">
                      <p><strong>Precio Unitario:</strong> ${insumoView.precioUnitarioUso?.toLocaleString()}</p>
                      <p><strong>Precio Total:</strong> ${insumoView.precioTotal?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Relaciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Categoría</h3>
                    <div className="space-y-2">
                      <p><strong>Nombre:</strong> {insumoView.categoria?.nombre || 'N/A'}</p>
                      <p><strong>Descripción:</strong> {insumoView.categoria?.descripcion || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Proveedor</h3>
                    <div className="space-y-2">
                      <p><strong>Nombre:</strong> {insumoView.proveedor?.nombre || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Almacén</h3>
                    <div className="space-y-2">
                      <p><strong>Nombre:</strong> {insumoView.almacen?.nombre || 'N/A'}</p>
                      <p><strong>Descripción:</strong> {insumoView.almacen?.descripcion || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
});

InsumoListFeature.displayName = 'InsumoListFeature';