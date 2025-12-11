import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { Form } from "@heroui/form";
import { parseDate } from "@internationalized/date";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Card, CardBody } from "@heroui/react";
import { Plus, Upload, Package, DollarSign, FileText } from "lucide-react";
import ImageUpload from "@/modules/inventario/widgets/ImageUpload";
import { useCategoriaInsumoList } from "../hooks/useCategoriaInsumoList";
import { useProveedorList } from "../hooks/useProveedorList";
import { useAlmacenList } from "../hooks/useAlmacenList";
import { useCreateCategoria } from "../hooks/useCreateCategoria";
import { useCreateProveedor } from "../hooks/useCreateProveedor";
import { useCreateAlmacen } from "../hooks/useCreateAlmacen";
import { useAuth } from "../../auth/hooks/useAuth";
import ConfirmationModal from "../widgets/ConfirmationModal";
import { uploadInsumoImage } from "../api/insumos.service";
import type { CreateInsumoInput, UpdateInsumoInput, Insumo, TipoEmpaque, UnidadPresentacion, TipoMateria } from "../model/types";
import { TIPO_EMPAQUE_OPTIONS, UNIDAD_PRESENTACION_OPTIONS, TIPO_MATERIA_OPTIONS, CONVERSION_TABLE } from "../model/constants";

interface InsumoFormProps {
  insumo?: Partial<Insumo>;
  onClose: () => void;
  onSuccess: (data: CreateInsumoInput | UpdateInsumoInput) => Promise<{ id?: number }>;
  isEdit?: boolean;
  hideFooter?: boolean;
}

export const InsumoForm = ({
  insumo,
  onClose,
  onSuccess,
  isEdit = !!insumo?.nombre,
  hideFooter = false
}: InsumoFormProps) => {
  const { data: categorias = [] } = useCategoriaInsumoList();
  const { data: proveedores = [] } = useProveedorList();
  const { data: almacenes = [] } = useAlmacenList();
  const { user } = useAuth();

  // Hooks para crear catálogos
  const createCategoriaMutation = useCreateCategoria();
  const createProveedorMutation = useCreateProveedor();
  const createAlmacenMutation = useCreateAlmacen();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<CreateInsumoInput | UpdateInsumoInput | null>(null);

  // Estados para modales de creación de catálogos
  const [isCreateCategoriaModalOpen, setIsCreateCategoriaModalOpen] = useState(false);
  const [isCreateProveedorModalOpen, setIsCreateProveedorModalOpen] = useState(false);
  const [isCreateAlmacenModalOpen, setIsCreateAlmacenModalOpen] = useState(false);
  const [newCategoriaName, setNewCategoriaName] = useState("");
  const [newProveedorName, setNewProveedorName] = useState("");
  const [newAlmacenName, setNewAlmacenName] = useState("");
  const [newAlmacenUbicacion, setNewAlmacenUbicacion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Limpiar estado cuando el formulario se resetea
  useEffect(() => {
    setSelectedFile(null);
  }, [insumo?.id]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validación obligatoria de descripción
    const descripcion = formData.get("descripcion") as string;
    if (!descripcion || descripcion.trim() === "") {
      alert("La descripción es obligatoria antes de continuar.");
      return;
    }

    const presentacionUnidad = formData.get("presentacionUnidad") as UnidadPresentacion;
    const conversion = CONVERSION_TABLE[presentacionUnidad];
    if (!conversion) {
      alert("Unidad de presentación no soportada");
      return;
    }

    const tipoMateriaValue = formData.get("tipoMateria") as string;
    const fechaIngresoValue = formData.get("fechaIngreso") as string;
    const fechaIngreso = fechaIngresoValue || new Date().toISOString().split('T')[0];

    // Check for optional image url from input (hidden or not) if needed, but we rely on state mostly
    // For now, construct the object
    const data = {
      nombre: formData.get("nombre") as string,
      descripcion: descripcion.trim(),
      tipoMateria: (tipoMateriaValue || "solido") as TipoMateria,
      presentacionTipo: formData.get("presentacionTipo") as TipoEmpaque,
      presentacionCantidad: parseFloat(formData.get("presentacionCantidad") as string),
      presentacionUnidad,
      unidadBase: conversion.unidadBase,
      factorConversion: conversion.factor,
      stockPresentaciones: parseInt(formData.get("stockPresentaciones") as string),
      precioUnitario: parseFloat(formData.get("precioUnitario") as string),
      fechaIngreso,
      idCategoria: parseInt(formData.get("idCategoria") as string),
      idProveedor: parseInt(formData.get("idProveedor") as string),
      idAlmacen: parseInt(formData.get("idAlmacen") as string),
      creadoPorUsuarioId: user?.id,
    };

    setPendingData(data);
    setIsModalOpen(true);
  };

  const handleConfirm = async (descripcion: string) => {
    if (pendingData) {
      const dataWithDescription = { ...pendingData, descripcionOperacion: descripcion };
      try {
        const result = await onSuccess(dataWithDescription);

        if (selectedFile && result?.id) {
          try {
            await uploadInsumoImage(result.id, selectedFile);
            if (!isEdit) alert('Insumo creado correctamente');
          } catch (uploadError) {
            console.error('Error subiendo imagen:', uploadError);
            alert('Insumo creado/actualizado, pero hubo un error subiendo la imagen.');
          }
        }

        setPendingData(null);
      } catch (error) {
        console.error('Error guardando insumo:', error);
        alert('Error al guardar el insumo. Verifique la consola.');
        return;
      }
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingData(null);
    setSelectedFile(null);
  };

  const handleCreateCategoria = () => {
    if (newCategoriaName.trim()) {
      createCategoriaMutation.mutate({ nombre: newCategoriaName.trim() }, {
        onSuccess: () => {
          setIsCreateCategoriaModalOpen(false);
          setNewCategoriaName("");
        }
      });
    }
  };

  const handleCreateProveedor = () => {
    if (newProveedorName.trim()) {
      createProveedorMutation.mutate({ nombre: newProveedorName.trim() }, {
        onSuccess: () => {
          setIsCreateProveedorModalOpen(false);
          setNewProveedorName("");
        }
      });
    }
  };

  const handleCreateAlmacen = () => {
    if (newAlmacenName.trim()) {
      createAlmacenMutation.mutate({
        nombre: newAlmacenName.trim(),
        descripcion: newAlmacenUbicacion.trim() || undefined,
      }, {
        onSuccess: () => {
          setIsCreateAlmacenModalOpen(false);
          setNewAlmacenName("");
          setNewAlmacenUbicacion("");
        }
      });
    }
  };

  const action = isEdit ? "editar" : "crear";

  return (
    <Form id="insumo-form" onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Image & Quick Info */}
        <div className="lg:col-span-4 space-y-4">
          <Card shadow="none" className="border border-gray-200 bg-white">
            <CardBody className="p-4">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-gray-500" /> Imagen del Insumo
              </label>
              <ImageUpload
                onFileChange={setSelectedFile}
                label="Subir foto"
              />
            </CardBody>
          </Card>

          <Card shadow="none" className="border border-gray-200 bg-white">
            <CardBody className="p-4 space-y-4">
              <div className="text-xs text-gray-500">
                <p className="font-semibold mb-1">Nota:</p>
                <p>Asegúrese de seleccionar la <strong>Unidad de Presentación</strong> correcta para que las conversiones automáticas funcionen (ej. Litros, Kg).</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Form Fields */}
        <div className="lg:col-span-8 space-y-5">

          {/* General Information */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Información General
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <Input
                name="nombre"
                label="Nombre del insumo"
                placeholder="Ej. Fertilizante Triple 15"
                defaultValue={insumo?.nombre}
                required
                variant="bordered"
                className="rounded-lg"
              />
              <Textarea
                name="descripcion"
                label="Descripción"
                placeholder="Detalles sobre el insumo..."
                defaultValue={insumo?.descripcion}
                required
                minRows={2}
                variant="bordered"
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <Select
                  name="idCategoria"
                  label="Categoría"
                  placeholder="Seleccione"
                  defaultSelectedKeys={insumo?.categoria?.id ? [insumo.categoria.id.toString()] : []}
                  required
                  variant="bordered"
                  className="flex-1"
                >
                  {categorias.map((cat) => (
                    <SelectItem key={cat?.id?.toString() || Math.random()} textValue={cat?.nombre || 'Sin nombre'}>{cat?.nombre || 'Sin nombre'}</SelectItem>
                  ))}
                </Select>
                <Button size="sm" isIconOnly variant="flat" color="success" onPress={() => setIsCreateCategoriaModalOpen(true)} className="mt-1">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Select
                name="tipoMateria"
                label="Tipo de Materia"
                placeholder="Seleccione"
                defaultSelectedKeys={insumo?.tipoMateria ? [insumo.tipoMateria] : ['solido']}
                required
                variant="bordered"
              >
                {TIPO_MATERIA_OPTIONS.map((option) => (
                  <SelectItem key={option.key} textValue={option.label}>{option.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Presentation & Stock */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" /> Presentación y Stock
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                name="presentacionTipo"
                label="Empaque"
                placeholder="Tipo"
                defaultSelectedKeys={insumo?.presentacionTipo ? [insumo.presentacionTipo] : []}
                required
                variant="bordered"
              >
                {TIPO_EMPAQUE_OPTIONS.map((option) => (
                  <SelectItem key={option.key} textValue={option.label}>{option.label}</SelectItem>
                ))}
              </Select>
              <Input
                name="presentacionCantidad"
                label="Cant. Presentación"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={insumo?.presentacionCantidad?.toString()}
                required
                variant="bordered"
              />
              <Select
                name="presentacionUnidad"
                label="Unidad"
                placeholder="Unidad"
                defaultSelectedKeys={insumo?.presentacionUnidad ? [insumo.presentacionUnidad] : []}
                required
                variant="bordered"
              >
                {UNIDAD_PRESENTACION_OPTIONS.map((option) => (
                  <SelectItem key={option.key} textValue={option.label}>{option.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="stockPresentaciones"
                label="Stock (Presentaciones)"
                type="number"
                placeholder="0"
                defaultValue={insumo?.stockPresentaciones?.toString()}
                required
                variant="bordered"
                description="Cantidad de paquetes/bultos disponibles"
              />
              <div className="flex gap-2">
                <Select
                  name="idAlmacen"
                  label="Almacén"
                  placeholder="Ubicación"
                  defaultSelectedKeys={insumo?.almacen?.id ? [insumo.almacen.id.toString()] : []}
                  required
                  variant="bordered"
                  className="flex-1"
                >
                  {almacenes.map((alm) => (
                    <SelectItem key={alm?.id?.toString() || Math.random()} textValue={alm?.nombre || 'Sin nombre'}>{alm?.nombre || 'Sin nombre'}</SelectItem>
                  ))}
                </Select>
                <Button size="sm" isIconOnly variant="flat" color="success" onPress={() => setIsCreateAlmacenModalOpen(true)} className="mt-1">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pricing & Provider */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" /> Precios y Proveedor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="precioUnitario"
                label="Precio Unitario"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={insumo?.precioUnitarioUso?.toString()}
                required
                variant="bordered"
                startContent={<span className="text-gray-400">$</span>}
              />
              <DatePicker
                name="fechaIngreso"
                label="Fecha Ingreso"
                defaultValue={insumo?.fechaIngreso ? parseDate(insumo.fechaIngreso.split('T')[0]) : parseDate(new Date().toISOString().split('T')[0])}
                isRequired
                variant="bordered"
              />
            </div>

            <div className="flex gap-2">
              <Select
                name="idProveedor"
                label="Proveedor"
                placeholder="Seleccione proveedor"
                defaultSelectedKeys={insumo?.proveedor?.id ? [insumo.proveedor.id.toString()] : []}
                required
                variant="bordered"
                className="flex-1"
              >
                {proveedores.map((prov) => (
                  <SelectItem key={prov?.id?.toString() || Math.random()} textValue={prov?.nombre || 'Sin nombre'}>{prov?.nombre || 'Sin nombre'}</SelectItem>
                ))}
              </Select>
              <Button size="sm" isIconOnly variant="flat" color="success" onPress={() => setIsCreateProveedorModalOpen(true)} className="mt-1">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>
      </div>

      {!hideFooter && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="light" color="danger" onPress={onClose} className="px-6">
            Cancelar
          </Button>
          <Button type="submit" color="success" className="px-6 text-black font-semibold shadow-sm">
            {isEdit ? "Actualizar Insumo" : "Crear Insumo"}
          </Button>
        </div>
      )}

      {/* Modals for Quick Creation (Category, Provider, Almacen) */}
      <Modal isOpen={isCreateCategoriaModalOpen} onOpenChange={setIsCreateCategoriaModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Nueva Categoría</ModalHeader>
          <ModalBody>
            <Input label="Nombre" value={newCategoriaName} onChange={(e) => setNewCategoriaName(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsCreateCategoriaModalOpen(false)}>Cancelar</Button>
            <Button color="success" className="text-black" onPress={handleCreateCategoria}>Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCreateProveedorModalOpen} onOpenChange={setIsCreateProveedorModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Nuevo Proveedor</ModalHeader>
          <ModalBody>
            <Input label="Nombre" value={newProveedorName} onChange={(e) => setNewProveedorName(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsCreateProveedorModalOpen(false)}>Cancelar</Button>
            <Button color="success" className="text-black" onPress={handleCreateProveedor}>Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCreateAlmacenModalOpen} onOpenChange={setIsCreateAlmacenModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Nuevo Almacén</ModalHeader>
          <ModalBody className="space-y-3">
            <Input label="Nombre" value={newAlmacenName} onChange={(e) => setNewAlmacenName(e.target.value)} />
            <Input label="Ubicación" value={newAlmacenUbicacion} onChange={(e) => setNewAlmacenUbicacion(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsCreateAlmacenModalOpen(false)}>Cancelar</Button>
            <Button color="success" className="text-black" onPress={handleCreateAlmacen}>Crear</Button>
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
      />
    </Form>
  );
};