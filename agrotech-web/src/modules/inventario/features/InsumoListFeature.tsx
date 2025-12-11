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
import { ViewInsumoModal } from '../ui/ViewInsumoModal';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Spinner } from "@heroui/react";
import type { Insumo, InsumoFilters as InsumoFiltersType } from '../model/types';

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

  /*
  const handleDelete = (insumo: Insumo) => {
    setInsumoToDelete(insumo);
    setIsDeleteModalOpen(true);
  };
  */

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
        await updateInsumoMutation.mutateAsync({
          id: selectedInsumo.id,
          payload: data
        });
        refetch();
        return {};
      } else {
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
        onDelete={undefined} // Disabled: Insumos should not be deleted
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
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          wrapper: "items-center justify-center overflow-hidden",
          base: "max-h-[90vh] w-full max-w-4xl mx-4 my-auto",
          body: "overflow-y-auto overflow-x-hidden max-h-[70vh] py-4",
          backdrop: "bg-black/50",
          header: "flex-shrink-0 border-b border-gray-200",
          footer: "flex-shrink-0"
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedInsumo ? `Editar Insumo: ${selectedInsumo.nombre}` : 'Nuevo Insumo'}
              </h2>
              <p className="text-sm text-gray-500 font-normal mt-1">
                {selectedInsumo ? 'Modifica los datos del insumo' : 'Registra materiales y suministros consumibles'}
              </p>
            </div>
          </ModalHeader>
          <ModalBody className="px-6">
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
                <Spinner color="success" label="Cargando movimientos..." />
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
          <div className="flex justify-end p-4 border-t border-gray-200">
            <Button color="danger" variant="light" onPress={() => setIsMovimientosModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* View Modal - New Redesigned Component */}
      <ViewInsumoModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        insumo={insumoView}
      />
    </div >
  );
});

InsumoListFeature.displayName = 'InsumoListFeature';
