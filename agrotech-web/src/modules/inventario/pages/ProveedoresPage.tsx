import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useState } from "react";
import { useProveedorList } from "../hooks/useProveedorList";
import { useUpdateProveedor } from "../hooks/useUpdateProveedor";
import { useRemoveProveedor } from "../hooks/useRemoveProveedor";
import { useCreateProveedor } from "../hooks/useCreateProveedor";
import { toast } from "react-hot-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import ProveedorForm from "../ui/widgets/ProveedorForm";
import type { Proveedor } from "../model/types";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "acciones", label: "Acciones" },
];

export default function ProveedoresPage() {
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: proveedores = [], isLoading } = useProveedorList();
  const createMutation = useCreateProveedor();
  const updateMutation = useUpdateProveedor();
  const removeMutation = useRemoveProveedor();

  const handleCreateSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Proveedor creado correctamente");
        setIsFormModalOpen(false);
      },
    });
  };

  const handleEditSubmit = (data: any) => {
    if (!selectedProveedor) return;
    updateMutation.mutate({ id: selectedProveedor.id, payload: data }, {
      onSuccess: () => {
        toast.success("Proveedor actualizado correctamente");
        setIsFormModalOpen(false);
        setSelectedProveedor(null);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedProveedor) return;
    removeMutation.mutate(selectedProveedor.id, {
      onSuccess: () => {
        toast.success("Proveedor eliminado correctamente");
        setIsDeleteModalOpen(false);
        setSelectedProveedor(null);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  const openCreateModal = () => {
    setSelectedProveedor(null);
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  const openEditModal = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setIsDeleteModalOpen(true);
  };

  const renderCell = (item: Proveedor, columnKey: string) => {
    switch (columnKey) {
      case "nombre":
        return item.nombre;
      case "acciones":
        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="light"
              isIconOnly
              className="text-[#17C964]"
              onPress={() => openEditModal(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              color="danger"
              onPress={() => openDeleteModal(item)}
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-sm opacity-70">Gestión de proveedores</p>
        </div>
        <Button
          color="success"
          className="text-black font-semibold"
          onPress={openCreateModal}
          startContent={<Plus className="h-4 w-4" />}
        >
          Crear Proveedor
        </Button>
      </div>

      <Table aria-label="Tabla de proveedores">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={proveedores} isLoading={isLoading} emptyContent="No hay proveedores">
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
            setSelectedProveedor(null);
          }
        }}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>
            {isEditMode ? "Editar Proveedor" : "Crear Proveedor"}
          </ModalHeader>
          <ModalBody>
            <ProveedorForm
              initialValues={isEditMode && selectedProveedor ? { nombre: selectedProveedor.nombre } : undefined}
              onSubmit={isEditMode ? handleEditSubmit : handleCreateSubmit}
              isLoading={isEditMode ? updateMutation.isPending : createMutation.isPending}
              submitLabel={isEditMode ? "Actualizar" : "Crear"}
              isEdit={isEditMode}
              onClose={() => setIsFormModalOpen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} backdrop="blur">
        <ModalContent>
          <ModalHeader>Confirmar eliminación</ModalHeader>
          <ModalBody>
            <p>¿Está seguro de que desea eliminar el proveedor '{selectedProveedor?.nombre}'?</p>
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