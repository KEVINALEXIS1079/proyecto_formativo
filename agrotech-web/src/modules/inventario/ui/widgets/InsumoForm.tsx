import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { Form } from "@heroui/form";
import { parseDate } from "@internationalized/date";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Plus } from "lucide-react";
import { useCategoriaInsumoList } from "../../hooks/useCategoriaInsumoList";
import { useProveedorList } from "../../hooks/useProveedorList";
import { useAlmacenList } from "../../hooks/useAlmacenList";
import { useCreateCategoria } from "../../hooks/useCreateCategoria";
import { useCreateProveedor } from "../../hooks/useCreateProveedor";
import { useCreateAlmacen } from "../../hooks/useCreateAlmacen";
import { useAuth } from "../../../auth/hooks/useAuth";
import type {
  CreateInsumoInput,
  UpdateInsumoInput,
  TipoEmpaque,
  UnidadPresentacion,
  TipoMateria,
} from "../../model/types";
import {
  TIPO_EMPAQUE_OPTIONS,
  UNIDAD_PRESENTACION_OPTIONS,
  TIPO_MATERIA_OPTIONS,
  CONVERSION_TABLE,
} from "../../model/constants";
import ImagePreview from "./ImagePreview";
import ConfirmationModal from "./ConfirmationModal";

interface InsumoFormProps {
  initialValues?: Partial<CreateInsumoInput & UpdateInsumoInput>;
  onSubmit: (data: CreateInsumoInput | UpdateInsumoInput) => void;
  onFileChange?: (file: File | null) => void;
  isLoading?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

export default function InsumoForm({
  initialValues,
  onSubmit,
  onFileChange,
  isLoading = false,
  submitLabel = "Guardar",
  isEdit = !!initialValues?.nombre,
}: InsumoFormProps) {
  const { data: categorias = [] } = useCategoriaInsumoList();
  const { data: proveedores = [] } = useProveedorList();
  const { data: almacenes = [] } = useAlmacenList();
  const { user } = useAuth();

  // Hooks para crear catálogos
  const createCategoriaMutation = useCreateCategoria();
  const createProveedorMutation = useCreateProveedor();
  const createAlmacenMutation = useCreateAlmacen();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<
    CreateInsumoInput | UpdateInsumoInput | null
  >(null);

  // Estados para modales de creación de catálogos
  const [isCreateCategoriaModalOpen, setIsCreateCategoriaModalOpen] =
    useState(false);
  const [isCreateProveedorModalOpen, setIsCreateProveedorModalOpen] =
    useState(false);
  const [isCreateAlmacenModalOpen, setIsCreateAlmacenModalOpen] =
    useState(false);
  const [newCategoriaName, setNewCategoriaName] = useState("");
  const [newProveedorName, setNewProveedorName] = useState("");
  const [newAlmacenName, setNewAlmacenName] = useState("");
  const [newAlmacenUbicacion, setNewAlmacenUbicacion] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Debug logs removed

    const imagenUrl = formData.get("imagenUrl") as string;
    const presentacionUnidad = formData.get(
      "presentacionUnidad"
    ) as UnidadPresentacion;
    const conversion = CONVERSION_TABLE[presentacionUnidad];
    if (!conversion) {
      alert("Unidad de presentación no soportada");
      return;
    }

    const tipoMateriaValue = formData.get("tipoMateria") as string;
    const presentacionTipoValue = formData.get("presentacionTipo") as string;

    // Manejar la fecha correctamente
    const fechaIngresoValue = formData.get("fechaIngreso") as string;
    const fechaIngreso =
      fechaIngresoValue || new Date().toISOString().split("T")[0];

    const data = {
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
      tipoMateria: (tipoMateriaValue || "solido") as TipoMateria,
      ...(imagenUrl && { imagenUrl }),
      presentacionTipo: (presentacionTipoValue || "bulto") as TipoEmpaque,
      presentacionCantidad: parseFloat(
        formData.get("presentacionCantidad") as string
      ),
      presentacionUnidad,
      unidadBase: conversion.unidadBase,
      factorConversion: conversion.factor,
      stockPresentaciones: parseInt(
        formData.get("stockPresentaciones") as string
      ),
      precioUnitario: parseFloat(formData.get("precioUnitario") as string),
      fechaIngreso,
      idCategoria: parseInt(formData.get("idCategoria") as string),
      idProveedor: parseInt(formData.get("idProveedor") as string),
      idAlmacen: parseInt(formData.get("idAlmacen") as string),
      creadoPorUsuarioId: user?.id, // Agregar ID del usuario actual
    };

    console.log("DEBUG: Form handleSubmit - Processed data:", data);
    setPendingData(data);
    setIsModalOpen(true);
  };

  const handleConfirm = (descripcion: string) => {
    if (pendingData) {
      const dataWithDescription = {
        ...pendingData,
        descripcionOperacion: descripcion,
      };
      onSubmit(dataWithDescription);
      if (!isEdit) alert("Insumo creado correctamente");
      setPendingData(null);
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingData(null);
  };

  // Funciones para crear catálogos
  const handleCreateCategoria = () => {
    if (newCategoriaName.trim()) {
      createCategoriaMutation.mutate(
        { nombre: newCategoriaName.trim() },
        {
          onSuccess: () => {
            setIsCreateCategoriaModalOpen(false);
            setNewCategoriaName("");
          },
        }
      );
    }
  };

  const handleCreateProveedor = () => {
    if (newProveedorName.trim()) {
      createProveedorMutation.mutate(
        { nombre: newProveedorName.trim() },
        {
          onSuccess: () => {
            setIsCreateProveedorModalOpen(false);
            setNewProveedorName("");
          },
        }
      );
    }
  };

  const handleCreateAlmacen = () => {
    if (newAlmacenName.trim()) {
      createAlmacenMutation.mutate(
        {
          nombre: newAlmacenName.trim(),
          descripcion: newAlmacenUbicacion.trim() || undefined,
        },
        {
          onSuccess: () => {
            setIsCreateAlmacenModalOpen(false);
            setNewAlmacenName("");
            setNewAlmacenUbicacion("");
          },
        }
      );
    }
  };

  const action = isEdit ? "editar" : "crear";

  return (
    <Form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6 p-6 bg-white rounded-xl shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="nombre"
          label="Nombre del insumo"
          placeholder="Ingrese el nombre"
          defaultValue={initialValues?.nombre}
          required
          className="rounded-lg"
        />
        <Input
          name="descripcion"
          label="Descripción"
          placeholder="Ingrese la descripción"
          defaultValue={initialValues?.descripcion}
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Select
          name="tipoMateria"
          label="Tipo de materia"
          placeholder="Seleccione tipo de materia"
          defaultSelectedKeys={
            initialValues?.tipoMateria
              ? [initialValues.tipoMateria]
              : ["solido"]
          }
          required
          className="rounded-lg"
        >
          {TIPO_MATERIA_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ImagePreview
          value={initialValues?.imagenUrl}
          onFileChange={onFileChange || (() => {})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          name="presentacionTipo"
          label="Tipo de presentación"
          placeholder="Seleccione tipo"
          defaultSelectedKeys={
            initialValues?.presentacionTipo
              ? [initialValues.presentacionTipo]
              : []
          }
          required
          className="rounded-lg"
        >
          {TIPO_EMPAQUE_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
        <Input
          name="presentacionCantidad"
          label="Cantidad de presentación"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={initialValues?.presentacionCantidad?.toString()}
          required
          className="rounded-lg"
        />
        <Select
          name="presentacionUnidad"
          label="Unidad de presentación"
          placeholder="Seleccione unidad"
          defaultSelectedKeys={
            initialValues?.presentacionUnidad
              ? [initialValues.presentacionUnidad]
              : []
          }
          required
          className="rounded-lg"
        >
          {UNIDAD_PRESENTACION_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="stockPresentaciones"
          label="Stock en presentaciones"
          type="number"
          placeholder="0"
          defaultValue={initialValues?.stockPresentaciones?.toString()}
          required
          className="rounded-lg"
        />
        <Input
          name="precioUnitario"
          label="Precio unitario"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={initialValues?.precioUnitario?.toString()}
          required
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <DatePicker
          name="fechaIngreso"
          label="Fecha de ingreso"
          defaultValue={
            initialValues?.fechaIngreso
              ? parseDate(initialValues.fechaIngreso.split("T")[0])
              : parseDate(new Date().toISOString().split("T")[0])
          }
          isRequired
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex gap-2">
          <Select
            name="idCategoria"
            label="Categoría"
            placeholder="Seleccione categoría"
            defaultSelectedKeys={
              initialValues?.idCategoria
                ? [initialValues.idCategoria.toString()]
                : []
            }
            required
            className="rounded-lg flex-1"
            aria-label="Seleccionar categoría"
          >
            {categorias.map((cat) => (
              <SelectItem key={cat?.id?.toString() || Math.random()}>
                {cat?.nombre || "Sin nombre"}
              </SelectItem>
            ))}
          </Select>
          <Button
            type="button"
            size="sm"
            variant="flat"
            color="primary"
            className="mt-6"
            onPress={() => setIsCreateCategoriaModalOpen(true)}
            isIconOnly
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Select
            name="idProveedor"
            label="Proveedor"
            placeholder="Seleccione proveedor"
            defaultSelectedKeys={
              initialValues?.idProveedor
                ? [initialValues.idProveedor.toString()]
                : []
            }
            required
            className="rounded-lg flex-1"
            aria-label="Seleccionar proveedor"
          >
            {proveedores.map((prov) => (
              <SelectItem key={prov?.id?.toString() || Math.random()}>
                {prov?.nombre || "Sin nombre"}
              </SelectItem>
            ))}
          </Select>
          <Button
            type="button"
            size="sm"
            variant="flat"
            color="primary"
            className="mt-6"
            onPress={() => setIsCreateProveedorModalOpen(true)}
            isIconOnly
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Select
            name="idAlmacen"
            label="Almacén"
            placeholder="Seleccione almacén"
            defaultSelectedKeys={
              initialValues?.idAlmacen
                ? [initialValues.idAlmacen.toString()]
                : []
            }
            required
            className="rounded-lg flex-1"
            aria-label="Seleccionar almacén"
          >
            {almacenes.map((alm) => (
              <SelectItem key={alm?.id?.toString() || Math.random()}>
                {alm?.nombre || "Sin nombre"}
              </SelectItem>
            ))}
          </Select>
          <Button
            type="button"
            size="sm"
            variant="flat"
            color="primary"
            className="mt-6"
            onPress={() => setIsCreateAlmacenModalOpen(true)}
            isIconOnly
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button
          type="submit"
          color="primary"
          isLoading={isLoading}
          className="px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {submitLabel}
        </Button>
      </div>

      {/* Modal para crear categoría */}
      <Modal
        isOpen={isCreateCategoriaModalOpen}
        onOpenChange={setIsCreateCategoriaModalOpen}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Crear Nueva Categoría</ModalHeader>
          <ModalBody>
            <Input
              label="Nombre de la categoría"
              placeholder="Ingrese el nombre"
              value={newCategoriaName}
              onChange={(e) => setNewCategoriaName(e.target.value)}
              required
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setIsCreateCategoriaModalOpen(false);
                setNewCategoriaName("");
              }}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleCreateCategoria}
              isLoading={createCategoriaMutation.isPending}
              disabled={!newCategoriaName.trim()}
            >
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para crear proveedor */}
      <Modal
        isOpen={isCreateProveedorModalOpen}
        onOpenChange={setIsCreateProveedorModalOpen}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Crear Nuevo Proveedor</ModalHeader>
          <ModalBody>
            <Input
              label="Nombre del proveedor"
              placeholder="Ingrese el nombre"
              value={newProveedorName}
              onChange={(e) => setNewProveedorName(e.target.value)}
              required
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setIsCreateProveedorModalOpen(false);
                setNewProveedorName("");
              }}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleCreateProveedor}
              isLoading={createProveedorMutation.isPending}
              disabled={!newProveedorName.trim()}
            >
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para crear almacén */}
      <Modal
        isOpen={isCreateAlmacenModalOpen}
        onOpenChange={setIsCreateAlmacenModalOpen}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Crear Nuevo Almacén</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Nombre del almacén"
              placeholder="Ingrese el nombre"
              value={newAlmacenName}
              onChange={(e) => setNewAlmacenName(e.target.value)}
              required
            />
            <Input
              label="Ubicación (opcional)"
              placeholder="Ingrese la ubicación física"
              value={newAlmacenUbicacion}
              onChange={(e) => setNewAlmacenUbicacion(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setIsCreateAlmacenModalOpen(false);
                setNewAlmacenName("");
                setNewAlmacenUbicacion("");
              }}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleCreateAlmacen}
              isLoading={createAlmacenMutation.isPending}
              disabled={!newAlmacenName.trim()}
            >
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
        title={`Confirmar ${action}`}
        message={`¿Está seguro de que desea ${action} el insumo '${pendingData?.nombre}'?`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        isLoading={isLoading}
      />
    </Form>
  );
}
