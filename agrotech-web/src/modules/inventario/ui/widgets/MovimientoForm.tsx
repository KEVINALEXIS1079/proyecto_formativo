import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { Form } from "@heroui/form";
import { useAlmacenList } from "../../hooks/useAlmacenList";
import type { CreateMovimientoInput, TipoMovimiento } from "../../model/types";
import { TIPO_MOVIMIENTO_OPTIONS } from "../../model/constants";

interface MovimientoFormProps {
  insumoId: number;
  onSubmit: (data: CreateMovimientoInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
}


export default function MovimientoForm({
  insumoId,
  onSubmit,
  isLoading = false,
  submitLabel = "Registrar Movimiento"
}: MovimientoFormProps) {
  const { data: almacenes = [] } = useAlmacenList();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const tipoMovimiento = formData.get("tipoMovimiento") as TipoMovimiento;

    const data: CreateMovimientoInput = {
      tipoMovimiento,
      cantidadPresentaciones: parseFloat(formData.get("cantidadPresentaciones") as string) || 0,
      cantidadBase: parseFloat(formData.get("cantidadBase") as string) || 0,
      valorMovimiento: parseFloat(formData.get("valorMovimiento") as string) || 0,
      descripcion: formData.get("descripcion") as string,
      fechaMovimiento: new Date().toISOString(),
      origen: `Movimiento ${tipoMovimiento.toLowerCase()} desde interfaz`,
      idUsuarioResponsable: 1, // TODO: obtener del contexto de autenticación
      idInsumo: insumoId,
      ...(formData.get("almacenOrigenId") && {
        almacenOrigenId: parseInt(formData.get("almacenOrigenId") as string)
      }),
      ...(formData.get("almacenDestinoId") && {
        almacenDestinoId: parseInt(formData.get("almacenDestinoId") as string)
      }),
    };

    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 p-6 bg-white rounded-xl shadow-lg">
      <div className="grid grid-cols-1 gap-4">
        <Select
          name="tipoMovimiento"
          label="Tipo de movimiento"
          placeholder="Seleccione tipo de movimiento"
          required
          className="rounded-lg"
        >
          {TIPO_MOVIMIENTO_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
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
          className="rounded-lg"
        />
        <Input
          name="cantidadBase"
          label="Cantidad en unidades base"
          type="number"
          step="0.01"
          placeholder="0.00"
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          name="valorMovimiento"
          label="Valor del movimiento"
          type="number"
          step="0.01"
          placeholder="0.00"
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          name="almacenOrigenId"
          label="Almacén origen"
          placeholder="Seleccione almacén origen"
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
          required
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