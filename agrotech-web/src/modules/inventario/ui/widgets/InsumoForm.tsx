import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { Form } from "@heroui/form";
import { parseDate } from "@internationalized/date";
import { useCategoriaInsumoList } from "../../hooks/useCategoriaInsumoList";
import { useProveedorList } from "../../hooks/useProveedorList";
import { useAlmacenList } from "../../hooks/useAlmacenList";
import type { CreateInsumoInput, UpdateInsumoInput, TipoEmpaque, UnidadPresentacion, UnidadBase } from "../../model/types";
import ImagePreview from "./ImagePreview";
import ConfirmationModal from "./ConfirmationModal";

interface InsumoFormProps {
  initialValues?: Partial<CreateInsumoInput & UpdateInsumoInput>;
  onSubmit: (data: CreateInsumoInput | UpdateInsumoInput) => void;
  onFileChange?: (file: File | null) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const TIPO_EMPAQUE_OPTIONS: { key: TipoEmpaque; label: string }[] = [
  { key: "bulto", label: "Bulto" },
  { key: "bolsa", label: "Bolsa" },
  { key: "paquete", label: "Paquete" },
  { key: "tarro", label: "Tarro" },
  { key: "botella", label: "Botella" },
  { key: "galón", label: "Galón" },
  { key: "caja", label: "Caja" },
];

const UNIDAD_PRESENTACION_OPTIONS: { key: UnidadPresentacion; label: string }[] = [
  { key: "kg", label: "Kilogramos" },
  { key: "g", label: "Gramos" },
  { key: "lb", label: "Libras" },
  { key: "L", label: "Litros" },
  { key: "mL", label: "Mililitros" },
  { key: "galón", label: "Galón" },
  { key: "unidad", label: "Unidad" },
];

const CONVERSION_TABLE: { [key: string]: { factor: number; unidadBase: UnidadBase } } = {
  'kg': { factor: 1000, unidadBase: 'g' },
  'g': { factor: 1, unidadBase: 'g' },
  'lb': { factor: 453.592, unidadBase: 'g' },
  'L': { factor: 1000, unidadBase: 'cm3' },
  'mL': { factor: 1, unidadBase: 'cm3' },
  'galón': { factor: 3785, unidadBase: 'cm3' },
  'unidad': { factor: 1, unidadBase: 'unidad' },
};

export default function InsumoForm({
  initialValues,
  onSubmit,
  onFileChange,
  isLoading = false,
  submitLabel = "Guardar"
}: InsumoFormProps) {
  const { data: categorias = [] } = useCategoriaInsumoList();
  const { data: proveedores = [] } = useProveedorList();
  const { data: almacenes = [] } = useAlmacenList();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<CreateInsumoInput | UpdateInsumoInput | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const imagenUrl = formData.get("imagenUrl") as string;
    const presentacionUnidad = formData.get("presentacionUnidad") as UnidadPresentacion;
    const conversion = CONVERSION_TABLE[presentacionUnidad];
    if (!conversion) {
      alert("Unidad de presentación no soportada");
      return;
    }

    const data = {
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
      ...(imagenUrl && { imagenUrl }),
      presentacionTipo: formData.get("presentacionTipo") as TipoEmpaque,
      presentacionCantidad: parseFloat(formData.get("presentacionCantidad") as string),
      presentacionUnidad,
      unidadBase: conversion.unidadBase,
      factorConversion: conversion.factor,
      stockPresentaciones: parseInt(formData.get("stockPresentaciones") as string),
      precioUnitario: parseFloat(formData.get("precioUnitario") as string),
      fechaIngreso: formData.get("fechaIngreso") as string,
      idCategoria: parseInt(formData.get("idCategoria") as string),
      idProveedor: parseInt(formData.get("idProveedor") as string),
      idAlmacen: parseInt(formData.get("idAlmacen") as string),
    };

    setPendingData(data);
    setIsModalOpen(true);
  };

  const handleConfirm = (descripcion: string) => {
    if (pendingData) {
      const dataWithDescription = { ...pendingData, descripcionOperacion: descripcion };
      onSubmit(dataWithDescription);
      setPendingData(null);
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingData(null);
  };

  const isEdit = !!initialValues?.nombre;
  const action = isEdit ? "editar" : "crear";

  return (
    <Form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 p-6 bg-white rounded-xl shadow-lg">
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
          defaultSelectedKeys={initialValues?.presentacionTipo ? [initialValues.presentacionTipo] : []}
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
          defaultSelectedKeys={initialValues?.presentacionUnidad ? [initialValues.presentacionUnidad] : []}
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
          defaultValue={initialValues?.fechaIngreso ? parseDate(initialValues.fechaIngreso.split('T')[0]) : undefined}
          isRequired
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          name="idCategoria"
          label="Categoría"
          placeholder="Seleccione categoría"
          defaultSelectedKeys={initialValues?.idCategoria ? [initialValues.idCategoria.toString()] : []}
          required
          className="rounded-lg"
        >
          {categorias.map((cat) => (
            <SelectItem key={cat.id.toString()}>{cat.nombre}</SelectItem>
          ))}
        </Select>
        <Select
          name="idProveedor"
          label="Proveedor"
          placeholder="Seleccione proveedor"
          defaultSelectedKeys={initialValues?.idProveedor ? [initialValues.idProveedor.toString()] : []}
          required
          className="rounded-lg"
        >
          {proveedores.map((prov) => (
            <SelectItem key={prov.id.toString()}>{prov.nombre}</SelectItem>
          ))}
        </Select>
        <Select
          name="idAlmacen"
          label="Almacén"
          placeholder="Seleccione almacén"
          defaultSelectedKeys={initialValues?.idAlmacen ? [initialValues.idAlmacen.toString()] : []}
          required
          className="rounded-lg"
        >
          {almacenes.map((alm) => (
            <SelectItem key={alm.id.toString()}>{alm.nombre}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="submit" color="primary" isLoading={isLoading} className="px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          {submitLabel}
        </Button>
      </div>

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