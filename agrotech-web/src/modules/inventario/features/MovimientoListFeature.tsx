import { useState, forwardRef, useImperativeHandle } from 'react';
import { useMovimientoList } from '../hooks/useMovimientoList';
import { useCreateMovimiento } from '../hooks/useCreateMovimiento';
import { useUpdateMovimiento } from '../hooks/useUpdateMovimiento';
import { useRemoveMovimiento } from '../hooks/useRemoveMovimiento';
import { MovimientoTable } from '../widgets/MovimientoTable';
import { MovimientoForm } from '../widgets/MovimientoForm';
import { MovimientoFilters } from '../widgets/MovimientoFilters';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { Button } from '@heroui/button';
import type { MovimientoInventario, MovimientoFilters as MovimientoFiltersType } from '../model/types';

export interface MovimientoListRef {
  openCreateModal: () => void;
}

export const MovimientoListFeature = forwardRef<MovimientoListRef>((_, ref) => {
  console.log('MovimientoListFeature: Component rendering');
  const [filters, setFilters] = useState<MovimientoFiltersType>({});

  const { data: movimientos = [], isLoading, refetch } = useMovimientoList(filters);

  const createMovimientoMutation = useCreateMovimiento();
  const updateMovimientoMutation = useUpdateMovimiento();
  const removeMovimientoMutation = useRemoveMovimiento();

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoInventario | undefined>(undefined);
  const [movimientoToDelete, setMovimientoToDelete] = useState<MovimientoInventario | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);


  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      setSelectedMovimiento(undefined);
      setIsEditMode(true);
      setIsManageModalOpen(true);
    },
  }));


  const handleManage = (movimiento: MovimientoInventario) => {
    setSelectedMovimiento(movimiento);
    setIsEditMode(false);
    setIsManageModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (movimientoToDelete) {
      try {
        await removeMovimientoMutation.mutateAsync(movimientoToDelete.id);
        setIsDeleteModalOpen(false);
        setMovimientoToDelete(undefined);
        refetch();
      } catch (error) {
        console.error('Error deleting movimiento:', error);
        alert('Error al eliminar el movimiento. Verifique la consola para más detalles.');
      }
    }
  };

  const handleFormSubmit = async (data: any): Promise<{ id?: number }> => {
    try {
      if (selectedMovimiento && isEditMode) {
        // Update
        await updateMovimientoMutation.mutateAsync({
          id: selectedMovimiento.id,
          payload: data
        });
        refetch();
        setIsManageModalOpen(false);
        return {};
      } else {
        // Create
        const result = await createMovimientoMutation.mutateAsync(data);
        refetch();
        setIsManageModalOpen(false);
        return { id: result.id };
      }
    } catch (error) {
      console.error('Error saving movimiento:', error);
      alert('Error al guardar el movimiento. Verifique la consola para más detalles.');
      throw error;
    }
  };

  return (
    <div className="flex flex-col">
      <MovimientoFilters filters={filters} onChange={setFilters} />

      <MovimientoTable
        movimientos={movimientos}
        isLoading={isLoading}
        onManage={handleManage}
      />

      {/* Gestionar Movimiento Modal (View/Edit/Create) */}
      <Modal
        isOpen={isManageModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsManageModalOpen(false);
            setSelectedMovimiento(undefined);
          }
        }}
        size="2xl"
        scrollBehavior='inside'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {selectedMovimiento
                  ? isEditMode
                    ? `Editar Movimiento: ${selectedMovimiento.tipoMovimiento}`
                    : `Gestionar Movimiento: ${selectedMovimiento.tipoMovimiento}`
                  : "Registrar Movimiento"}
              </ModalHeader>
              <ModalBody>
                <MovimientoForm
                  movimiento={selectedMovimiento}
                  readOnly={!isEditMode && !!selectedMovimiento}
                  onToggleEdit={() => { }} // Editing disabled
                  onCancel={() => {
                    if (isEditMode && selectedMovimiento) {
                      setIsEditMode(false);
                    } else {
                      onClose();
                    }
                  }}
                  onClose={() => {
                    onClose();
                    setSelectedMovimiento(undefined);
                  }}
                  onSuccess={handleFormSubmit}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Eliminar Movimiento</ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600">
              ¿Estás seguro de eliminar este movimiento de tipo <strong>"{movimientoToDelete?.tipoMovimiento}"</strong>?
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
              isLoading={removeMovimientoMutation.isPending}
            >
              Eliminar
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
});

MovimientoListFeature.displayName = 'MovimientoListFeature';