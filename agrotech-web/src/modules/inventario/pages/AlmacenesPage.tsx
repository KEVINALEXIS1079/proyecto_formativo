import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useState } from "react";
import { useAlmacenList } from "../hooks/useAlmacenList";
import { useAlmacenById } from "../hooks/useAlmacenById";
import { useCreateAlmacen } from "../hooks/useCreateAlmacen";
import { useUpdateAlmacen } from "../hooks/useUpdateAlmacen";
import { useRemoveAlmacen } from "../hooks/useRemoveAlmacen";
import { toast } from "react-hot-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import AlmacenForm from "../ui/widgets/AlmacenForm";
import type { Almacen } from "../model/types";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "descripcion", label: "Descripción" },
  { key: "acciones", label: "Acciones" },
];

export default function AlmacenesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: almacenes = [], isLoading } = useAlmacenList();
  const { data: almacen } = useAlmacenById(selectedId || 0); // Fetch for edit

  const createMutation = useCreateAlmacen();
  const updateMutation = useUpdateAlmacen();
  const removeMutation = useRemoveAlmacen();

  const handleCreateSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Almacén creado correctamente");
        setIsFormModalOpen(false);
      },
    });
  };

  const handleEditSubmit = (data: any) => {
    if (!selectedId) return;
    updateMutation.mutate({ id: selectedId, payload: data }, {
      onSuccess: () => {
        toast.success("Almacén actualizado correctamente");
        setIsFormModalOpen(false);
        setSelectedId(null);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedId) return;
    removeMutation.mutate(selectedId, {
      onSuccess: () => {
        toast.success("Almacén eliminado correctamente");
        setIsDeleteModalOpen(false);
        setSelectedId(null);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  const openCreateModal = () => {
    setSelectedId(null);
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  const openEditModal = (id: number) => {
    setSelectedId(id);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  const renderCell = (item: Almacen, columnKey: string) => {
    switch (columnKey) {
      case "nombre":
        return <div className="font-semibold">{item.nombre}</div>;
      case "descripcion":
        return item.descripcion || "N/A";
      case "acciones":
        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="light"
              isIconOnly
              className="text-[#17C964]"
              onPress={() => openEditModal(item.id)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              color="danger"
              onPress={() => openDeleteModal(item.id)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Almacenes</h1>
          <p className="text-sm opacity-70">Gestión de almacenes</p>
        </div>
        <Button
          color="success"
          className="text-black font-semibold"
          onPress={openCreateModal}
          startContent={<Plus className="h-4 w-4" />}
        >
          Crear Almacén
        </Button>
      </div>

      <Table aria-label="Tabla de almacenes">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={almacenes} isLoading={isLoading} emptyContent="No hay almacenes">
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal de Creación/Edición */}
      <Modal
        isOpen={isFormModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormModalOpen(false);
            setSelectedId(null);
          }
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            {isEditMode ? "Editar Almacén" : "Crear Almacén"}
          </ModalHeader>
          <ModalBody>
            {isEditMode ? (
              !almacen ? (
                <div>Cargando información del almacén...</div>
              ) : (
                <AlmacenForm
                  initialValues={{ nombre: (almacen as any)?.nombre, descripcion: (almacen as any)?.descripcion }}
                  onSubmit={handleEditSubmit}
                  isLoading={updateMutation.isPending}
                  submitLabel="Actualizar"
                  onClose={() => setIsFormModalOpen(false)}
                />
              )
            ) : (
              <AlmacenForm
                initialValues={undefined}
                onSubmit={handleCreateSubmit}
                isLoading={createMutation.isPending}
                submitLabel="Crear"
                onClose={() => setIsFormModalOpen(false)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} backdrop="blur">
        <ModalContent>
          <ModalHeader>Confirmar eliminación</ModalHeader>
          <ModalBody>
            <p>¿Está seguro de que desea eliminar este almacén?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)} disabled={removeMutation.isPending}>
              Cancelar
            </Button>
            <Button color="danger" onPress={handleConfirmDelete} isLoading={removeMutation.isPending}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}