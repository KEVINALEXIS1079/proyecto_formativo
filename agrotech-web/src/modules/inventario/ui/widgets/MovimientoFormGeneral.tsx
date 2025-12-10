import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { Form } from "@heroui/form";
import { DatePicker } from "@heroui/date-picker";
import { parseDate } from "@internationalized/date";
import { useAlmacenList } from "../../hooks/useAlmacenList";
import { useInsumoList } from "../../hooks/useInsumoList";
import type { CreateMovimientoInput, UpdateMovimientoInput, TipoMovimiento } from "../../model/types";

interface MovimientoFormGeneralProps {
  initialValues?: Partial<CreateMovimientoInput & UpdateMovimientoInput>;
  onSubmit: (data: CreateMovimientoInput | UpdateMovimientoInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

const TIPO_MOVIMIENTO_OPTIONS: { key: TipoMovimiento; label: string }[] = [
  { key: "REGISTRO", label: "Registro inicial" },
  { key: "AJUSTE", label: "Ajuste (corrección de stock)" },
  { key: "CONSUMO", label: "Consumo (uso en actividades)" },
  { key: "TRASLADO", label: "Traslado (entre almacenes)" },
  { key: "ELIMINACION", label: "Eliminación/Restauración" },
];

export default function MovimientoFormGeneral({
  initialValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Guardar",
  isEdit = !!initialValues?.tipoMovimiento
}: MovimientoFormGeneralProps) {
  const { data: almacenes = [] } = useAlmacenList();
  const { data: insumos = [] } = useInsumoList();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const tipoMovimiento = formData.get("tipoMovimiento") as TipoMovimiento;
    const fechaMovimientoValue = formData.get("fechaMovimiento") as string;
    const fechaMovimiento = fechaMovimientoValue || new Date().toISOString();

    const data = {
      tipoMovimiento,
      cantidadPresentaciones: parseFloat(formData.get("cantidadPresentaciones") as string) || 0,
      cantidadBase: parseFloat(formData.get("cantidadBase") as string) || 0,
      valorMovimiento: parseFloat(formData.get("valorMovimiento") as string) || 0,
      descripcion: formData.get("descripcion") as string,
      fechaMovimiento,
      origen: formData.get("origen") as string || `Movimiento ${tipoMovimiento.toLowerCase()}`,
      idUsuarioResponsable: parseInt(formData.get("idUsuarioResponsable") as string) || 1, // TODO: obtener del contexto
      idInsumo: parseInt(formData.get("idInsumo") as string),
      ...(formData.get("almacenOrigenId") && {
        almacenOrigenId: parseInt(formData.get("almacenOrigenId") as string)
      }),
      ...(formData.get("almacenDestinoId") && {
        almacenDestinoId: parseInt(formData.get("almacenDestinoId") as string)
      }),
      ...(formData.get("actividadId") && {
        actividadId: parseInt(formData.get("actividadId") as string)
      }),
    };

    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 p-6 bg-white rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          name="tipoMovimiento"
          label="Tipo de movimiento"
          placeholder="Seleccione tipo de movimiento"
          defaultSelectedKeys={initialValues?.tipoMovimiento ? [initialValues.tipoMovimiento] : []}
          required
          className="rounded-lg"
        >
          {TIPO_MOVIMIENTO_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
        <Select
          name="idInsumo"
          label="Insumo"
          placeholder="Seleccione insumo"
          defaultSelectedKeys={initialValues?.idInsumo ? [initialValues.idInsumo.toString()] : []}
          required
          className="rounded-lg"
        >
          {((insumos as any)?.items || (insumos as any) || []).map((insumo: any) => (
            <SelectItem key={insumo?.id?.toString() || Math.random()}>
              {insumo?.nombre || 'Sin nombre'}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="cantidadPresentaciones"
          label="Cantidad en presentaciones"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={initialValues?.cantidadPresentaciones?.toString()}
          required
          className="rounded-lg"
        />
        <Input
          name="cantidadBase"
          label="Cantidad en unidades base"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={initialValues?.cantidadBase?.toString()}
          required
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="valorMovimiento"
          label="Valor del movimiento"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={initialValues?.valorMovimiento?.toString()}
          required
          className="rounded-lg"
        />
        <DatePicker
          name="fechaMovimiento"
          label="Fecha del movimiento"
          defaultValue={initialValues?.fechaMovimiento ? parseDate(initialValues.fechaMovimiento.split('T')[0]) : parseDate(new Date().toISOString().split('T')[0])}
          isRequired
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          name="almacenOrigenId"
          label="Almacén origen"
          placeholder="Seleccione almacén origen"
          defaultSelectedKeys={initialValues?.almacenOrigenId ? [initialValues.almacenOrigenId.toString()] : []}
          className="rounded-lg"
        >
          {almacenes.map((alm) => (
            <SelectItem key={alm?.id?.toString() || Math.random()}>
              {alm?.nombre || 'Sin nombre'}
            </SelectItem>
          ))}
        </Select>
        <Select
          name="almacenDestinoId"
          label="Almacén destino"
          placeholder="Seleccione almacén destino"
          defaultSelectedKeys={initialValues?.almacenDestinoId ? [initialValues.almacenDestinoId.toString()] : []}
          className="rounded-lg"
        >
          {almacenes.map((alm) => (
            <SelectItem key={alm?.id?.toString() || Math.random()}>
              {alm?.nombre || 'Sin nombre'}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Textarea
          name="descripcion"
          label="Descripción"
          placeholder="Describa el movimiento..."
          defaultValue={initialValues?.descripcion}
          required
          className="rounded-lg"
        />
        <Input
          name="origen"
          label="Origen"
          placeholder="Origen del movimiento"
          defaultValue={initialValues?.origen}
          className="rounded-lg"
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="submit" color="primary" isLoading={isLoading} className="px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}