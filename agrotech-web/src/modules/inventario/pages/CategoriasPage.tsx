import { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { useCategoriaInsumoList } from "../hooks/useCategoriaInsumoList";
import { useCreateCategoria } from "../hooks/useCreateCategoria";
import { useUpdateCategoria } from "../hooks/useUpdateCategoria";
import { useRemoveCategoria } from "../hooks/useRemoveCategoria";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import CategoriaForm from "../ui/widgets/CategoriaForm";
import ConfirmationModal from "../ui/widgets/ConfirmationModal";
import type { CategoriaInsumo } from "../model/types";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "descripcion", label: "Descripción" },
  { key: "acciones", label: "Acciones" },
];

export default function CategoriasPage() {
  const { data: categorias = [], isLoading } = useCategoriaInsumoList();
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const removeMutation = useRemoveCategoria();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaInsumo | null>(null);

  const renderCell = (item: CategoriaInsumo, columnKey: string) => {
    switch (columnKey) {
      case "nombre":
        return item.nombre;
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
              onPress={() => {
                setSelectedCategoria(item);
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              color="danger"
              onPress={() => {
                setSelectedCategoria(item);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return "";
    }
  };

  const handleCreateSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Categoría creada correctamente");
        setIsCreateModalOpen(false);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || "Error al crear la categoría";
        toast.error(errorMessage);
      },
    });
  };

  const handleUpdateSubmit = (data: any) => {
    if (selectedCategoria) {
      updateMutation.mutate({ id: selectedCategoria.id, data }, {
        onSuccess: () => {
          toast.success("Categoría actualizada correctamente");
          setIsEditModalOpen(false);
          setSelectedCategoria(null);
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || error?.message || "Error al actualizar la categoría";
          toast.error(errorMessage);
        },
      });
    }
  };

  const handleConfirmDelete = async (descripcion: string) => {
    if (selectedCategoria) {
      try {
        await removeMutation.mutateAsync(selectedCategoria.id);
        toast.success("Categoría eliminada correctamente");
        setIsDeleteModalOpen(false);
        setSelectedCategoria(null);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || "Error al eliminar la categoría";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Categorías de Insumos</h1>
          <p className="text-sm opacity-70">Gestión de categorías</p>
        </div>
        <Button
          color="success"
          className="text-black font-semibold"
          onClick={() => setIsCreateModalOpen(true)}
          startContent={<Plus className="w-4 h-4" />}
        >
          Crear Categoría
        </Button>
      </div>

      <Table aria-label="Tabla de categorías">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={categorias} isLoading={isLoading} emptyContent="No hay categorías">
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal para crear categoría */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="2xl"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>Crear Nueva Categoría</ModalHeader>
          <ModalBody>
            <CategoriaForm
              onSubmit={handleCreateSubmit}
              isLoading={createMutation.isPending}
              submitLabel="Crear"
              isEdit={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para editar categoría */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategoria(null);
        }}
        size="2xl"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>Editar Categoría</ModalHeader>
          <ModalBody>
            <CategoriaForm
              initialValues={selectedCategoria || {}}
              onSubmit={handleUpdateSubmit}
              isLoading={updateMutation.isPending}
              submitLabel="Actualizar"
              isEdit={true}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCategoria(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${selectedCategoria?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isLoading={removeMutation.isPending}
      />
    </div>
  );
}