import { forwardRef, useImperativeHandle, useState } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Input,
  Textarea,
} from "@heroui/react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useTipoEpaList,
  useCreateTipoEpa,
  useUpdateTipoEpa,
  useRemoveTipoEpa,
} from "../hooks/useFitosanitario";
import type { TipoEpa, CreateTipoEpaInput } from "../models/types";

export interface TipoEpaListRef {
  openCreateModal: () => void;
}

const TipoEpaFeature = forwardRef<TipoEpaListRef>((_, ref) => {
  const { data: tiposEpa = [], isLoading } = useTipoEpaList();
  const createMutation = useCreateTipoEpa();
  const updateMutation = useUpdateTipoEpa();
  const removeMutation = useRemoveTipoEpa();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoEpa | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<TipoEpa | null>(null);

  const [form, setForm] = useState<Partial<CreateTipoEpaInput>>({
    nombre: "",
    descripcion: "",
    tipoEpaEnum: "enfermedad",
  });

  const resetForm = () => {
    setForm({ nombre: "", descripcion: "", tipoEpaEnum: "enfermedad" });
  };

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      resetForm();
      setEditingTipo(null);
      setIsFormOpen(true);
    },
  }));

  const handleEdit = (tipo: TipoEpa) => {
    setForm({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      tipoEpaEnum: tipo.tipoEpaEnum,
    });
    setEditingTipo(tipo);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nombre?.trim() || !form.tipoEpaEnum) return;

    try {
      if (editingTipo) {
        await updateMutation.mutateAsync({
          id: editingTipo.id,
          input: {
            nombre: form.nombre.trim(),
            descripcion: form.descripcion?.trim() || "",
            tipoEpaEnum: form.tipoEpaEnum,
          },
        });
        toast.success("Tipo EPA actualizado");
      } else {
        await createMutation.mutateAsync({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion?.trim() || "",
          tipoEpaEnum: form.tipoEpaEnum,
        });
        toast.success("Tipo EPA creado");
      }

      setIsFormOpen(false);
      setEditingTipo(null);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (tipo: TipoEpa) => {
    try {
      await removeMutation.mutateAsync(tipo.id);
      toast.success("Tipo EPA eliminado");
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
      <Table aria-label="Tabla de tipos EPA" isVirtualized={false} removeWrapper>
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="No hay tipos EPA registrados">
          {tiposEpa.map((tipo) => (
            <TableRow key={tipo.id}>
              <TableCell>{tipo.id}</TableCell>
              <TableCell>{tipo.nombre}</TableCell>
              <TableCell>{tipo.descripcion}</TableCell>
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
        isOpen={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingTipo(null);
            resetForm();
          }
        }}
        size="md"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>{editingTipo ? "Editar Tipo EPA" : "Crear Tipo EPA"}</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Nombre"
              value={form.nombre || ""}
              onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
              placeholder="Nombre del tipo"
              variant="bordered"
            />
            <Textarea
              label="Descripción"
              value={form.descripcion || ""}
              onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
              placeholder="Descripción del tipo"
              variant="bordered"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setIsFormOpen(false);
                setEditingTipo(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              color="success"
              className="text-black font-medium"
              onPress={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              isDisabled={!form.nombre?.trim()}
            >
              {editingTipo ? "Actualizar" : "Crear"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Confirmar Eliminaci\u00f3n */}
      <Modal isOpen={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <ModalContent>
          <ModalHeader>Confirmar eliminaci\u00f3n</ModalHeader>
          <ModalBody>
            <p>\u00bfDesea eliminar este tipo de EPA?</p>
            <p className="text-sm text-default-500 mt-2">Esta acci\u00f3n no se puede deshacer.</p>
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

TipoEpaFeature.displayName = "TipoEpaFeature";

export default TipoEpaFeature;
