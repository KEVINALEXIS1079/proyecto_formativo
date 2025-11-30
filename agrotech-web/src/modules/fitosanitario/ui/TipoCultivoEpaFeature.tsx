
import { useState, forwardRef, useImperativeHandle } from "react";
import { Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input, Textarea } from "@heroui/react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTipoCultivoEpaList, useCreateTipoCultivoEpa, useUpdateTipoCultivoEpa, useRemoveTipoCultivoEpa } from "../hooks/useFitosanitario";
import type { TipoCultivoEpa, CreateTipoCultivoEpaInput } from "../models/types";

export interface TipoCultivoEpaListRef {
  openCreateModal: () => void;
}

const TipoCultivoEpaFeature = forwardRef<TipoCultivoEpaListRef>((_, ref) => {
  const { data: tiposCultivoEpa = [], isLoading } = useTipoCultivoEpaList();
  const createMutation = useCreateTipoCultivoEpa();
  const updateMutation = useUpdateTipoCultivoEpa();
  const removeMutation = useRemoveTipoCultivoEpa();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoCultivoEpa | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<TipoCultivoEpa | null>(null);

  const [form, setForm] = useState<Partial<CreateTipoCultivoEpaInput>>({
    nombre: "",
    descripcion: "",
  });

  const resetForm = () => {
    setForm({ nombre: "", descripcion: "" });
  };

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      resetForm();
      setShowCreateModal(true);
    },
  }));

  const handleEdit = (tipo: TipoCultivoEpa) => {
    setForm({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || "",
    });
    setEditingTipo(tipo);
  };

  const handleSubmit = async () => {
    if (!form.nombre?.trim()) return;

    try {
      if (editingTipo) {
        await updateMutation.mutateAsync({
          id: editingTipo.id,
          input: {
            nombre: form.nombre.trim(),
            descripcion: form.descripcion?.trim() || undefined,
          },
        });
        toast.success("Tipo cultivo EPA actualizado");
      } else {
        await createMutation.mutateAsync({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion?.trim() || undefined,
        });
        toast.success("Tipo cultivo EPA creado");
      }
      setShowCreateModal(false);
      setEditingTipo(null);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (tipo: TipoCultivoEpa) => {
    try {
      await removeMutation.mutateAsync(tipo.id);
      toast.success("Tipo cultivo EPA eliminado");
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "acciones", label: "Acciones" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabla */}
      <Table aria-label="Tabla de tipos cultivo EPA" isVirtualized={false} removeWrapper>
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          emptyContent="No hay tipos cultivo EPA registrados"
        >
          {tiposCultivoEpa.map((tipo) => (
            <TableRow key={tipo.id}>
              <TableCell>{tipo.id}</TableCell>
              <TableCell>{tipo.nombre}</TableCell>
              <TableCell>{tipo.descripcion || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    className="text-[#17C964]"
                    onPress={() => handleEdit(tipo)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    color="danger"
                    onPress={() => setShowDeleteConfirm(tipo)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showCreateModal || !!editingTipo}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setEditingTipo(null);
            resetForm();
          }
        }}
        size="md"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>
            {editingTipo ? "Editar Tipo Cultivo EPA" : "Crear Tipo Cultivo EPA"}
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Nombre"
              value={form.nombre || ""}
              onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
              placeholder="Nombre del tipo cultivo"
              variant="bordered"
            />
            <Textarea
              label="Descripción (opcional)"
              value={form.descripcion || ""}
              onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
              placeholder="Descripción del tipo cultivo"
              variant="bordered"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setShowCreateModal(false);
                setEditingTipo(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              isDisabled={!form.nombre?.trim()}
            >
              {editingTipo ? "Actualizar" : "Crear"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(null)}
      >
        <ModalContent>
          <ModalHeader>Confirmar eliminación</ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de eliminar el tipo cultivo EPA <strong>"{showDeleteConfirm?.nombre}"</strong>?
            </p>
            <p className="text-sm text-default-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
              isLoading={removeMutation.isPending}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default TipoCultivoEpaFeature;