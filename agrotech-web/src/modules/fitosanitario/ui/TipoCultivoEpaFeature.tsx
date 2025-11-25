import { useState } from "react";
import { Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input, Textarea } from "@heroui/react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTipoCultivoEpaList, useCreateTipoCultivoEpa, useUpdateTipoCultivoEpa, useRemoveTipoCultivoEpa } from "../hooks/useFitosanitario";
import type { TipoCultivoEpa, CreateTipoCultivoEpaInput } from "../model/types";

export default function TipoCultivoEpaFeature() {
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

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tipos Cultivo EPA</h1>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={handleCreate}
        >
          Nuevo Tipo Cultivo EPA
        </Button>
      </div>

      {/* Tabla */}
      <Table aria-label="Tabla de tipos cultivo EPA" isVirtualized={false}>
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
                    variant="flat"
                    startContent={<Edit size={14} />}
                    onPress={() => handleEdit(tipo)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<Trash2 size={14} />}
                    onPress={() => setShowDeleteConfirm(tipo)}
                  >
                    Eliminar
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
            />
            <Textarea
              label="Descripción (opcional)"
              value={form.descripcion || ""}
              onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
              placeholder="Descripción del tipo cultivo"
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
}