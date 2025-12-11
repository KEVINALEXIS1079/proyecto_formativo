import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { Form } from "@heroui/form";
import { useInsumoList } from "../hooks/useInsumoList";
import { useAlmacenList } from "../hooks/useAlmacenList";
import { useAuth } from "../../auth/hooks/useAuth";
import ConfirmationModal from "../widgets/ConfirmationModal";
import type { CreateMovimientoInput, UpdateMovimientoInput, TipoMovimiento, MovimientoInventario } from "../model/types";
import { TIPO_MOVIMIENTO_OPTIONS } from "../model/constants";

interface MovimientoFormProps {
  movimiento?: Partial<MovimientoInventario>;
  onClose: () => void;
  onSuccess: (data: CreateMovimientoInput | UpdateMovimientoInput) => Promise<{ id?: number }>;
  readOnly?: boolean;
  onToggleEdit?: () => void;
  onCancel?: () => void;
  hideFooter?: boolean;
}


export const MovimientoForm = ({
  movimiento,
  onClose,
  onSuccess,
  readOnly = false,
  onToggleEdit,
  onCancel,
  hideFooter = false
}: MovimientoFormProps) => {
  const { data: insumosResponse } = useInsumoList({ limit: 100 });
  const { data: almacenes = [] } = useAlmacenList();
  const { user } = useAuth();

  const insumos = insumosResponse?.items ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<CreateMovimientoInput | UpdateMovimientoInput | null>(null);
  const [selectedTipoMovimiento, setSelectedTipoMovimiento] = useState<TipoMovimiento>(
    movimiento?.tipoMovimiento || "REGISTRO"
  );

  const isEdit = !!movimiento?.id;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (readOnly) return;

    const formData = new FormData(e.currentTarget);

    const tipoMovimiento = formData.get("tipoMovimiento") as TipoMovimiento;
    const cantidadPresentaciones = parseFloat(formData.get("cantidadPresentaciones") as string);
    const valorMovimiento = parseFloat(formData.get("valorMovimiento") as string);
    const descripcion = formData.get("descripcion") as string;
    const fechaMovimiento = formData.get("fechaMovimiento") as string;
    const origen = formData.get("origen") as string;
    const idInsumo = parseInt(formData.get("idInsumo") as string);

    // Calcular cantidad base (esto debería hacerse en el backend realmente, pero por simplicidad)
    const insumoSeleccionado = insumos.find(i => i.id === idInsumo);
    const cantidadBase = insumoSeleccionado ?
      cantidadPresentaciones * insumoSeleccionado.presentacionCantidad * insumoSeleccionado.factorConversion : 0;

    const data: CreateMovimientoInput = {
      tipoMovimiento,
      cantidadPresentaciones,
      cantidadBase,
      valorMovimiento,
      descripcion,
      fechaMovimiento,
      origen,
      idUsuarioResponsable: user?.id || 1, // Usuario actual o default
      idInsumo,
    };

    // Agregar campos opcionales para traslados
    if (tipoMovimiento === "TRASLADO") {
      const almacenOrigenId = formData.get("almacenOrigenId") ?
        parseInt(formData.get("almacenOrigenId") as string) : undefined;
      const almacenDestinoId = formData.get("almacenDestinoId") ?
        parseInt(formData.get("almacenDestinoId") as string) : undefined;

      if (almacenOrigenId) data.almacenOrigenId = almacenOrigenId;
      if (almacenDestinoId) data.almacenDestinoId = almacenDestinoId;
    }

    setPendingData(data);
    setIsModalOpen(true);
  };

  const handleConfirm = async (descripcion: string) => {
    if (pendingData) {
      const dataWithDescription = { ...pendingData, descripcion: `${pendingData.descripcion} - ${descripcion}` };
      try {
        await onSuccess(dataWithDescription);
        setPendingData(null);
      } catch (error) {
        console.error('Error guardando movimiento:', error);
        alert('Error al guardar el movimiento. Verifique la consola para más detalles.');
        return;
      }
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingData(null);
  };

  const action = isEdit ? "editar" : "crear";

  const renderFooter = () => {
    if (readOnly) {
      return (
        <>
          <Button variant="light" onPress={onClose}>
            Cerrar
          </Button>
          {onToggleEdit && (
            <Button color="success" className="text-black font-medium" onPress={onToggleEdit}>
              Editar
            </Button>
          )}
        </>
      );
    }

    return (
      <>
        <Button variant="light" onPress={onCancel || onClose}>
          Cancelar
        </Button>
        <Button type="submit" color="success" className="text-black font-medium shadow-md hover:shadow-lg">
          {isEdit ? "Guardar Cambios" : "Crear Movimiento"}
        </Button>
      </>
    );
  };


  return (
    <Form id="movimiento-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 p-6 bg-white rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          name="tipoMovimiento"
          label="Tipo de movimiento"
          placeholder="Seleccione tipo"
          defaultSelectedKeys={movimiento?.tipoMovimiento ? [movimiento.tipoMovimiento] : ['REGISTRO']}
          required
          isDisabled={readOnly}
          className="rounded-lg"
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as TipoMovimiento;
            setSelectedTipoMovimiento(value);
          }}
        >
          {TIPO_MOVIMIENTO_OPTIONS.map((option) => (
            <SelectItem key={option.key} textValue={option.label}>{option.label}</SelectItem>
          ))}
        </Select>

        <Select
          name="idInsumo"
          label="Insumo"
          placeholder="Seleccione insumo"
          defaultSelectedKeys={movimiento?.insumo?.id ? [movimiento.insumo.id.toString()] : []}
          required
          isDisabled={readOnly}
          className="rounded-lg"
        >
          {insumos.map((insumo) => (
            <SelectItem key={insumo.id} textValue={insumo.nombre}>
              {insumo.nombre}
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
          defaultValue={movimiento?.cantidadPresentaciones?.toString()}
          required
          readOnly={readOnly}
          className="rounded-lg"
        />

        <Input
          name="valorMovimiento"
          label="Valor del movimiento"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={movimiento?.valorMovimiento?.toString()}
          required
          readOnly={readOnly}
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Textarea
          name="descripcion"
          label="Descripción"
          placeholder="Describa el movimiento"
          defaultValue={movimiento?.descripcion}
          required
          readOnly={readOnly}
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="fechaMovimiento"
          label="Fecha del movimiento"
          type="datetime-local"
          defaultValue={movimiento?.fechaMovimiento ?
            new Date(movimiento.fechaMovimiento).toISOString().slice(0, 16) :
            new Date().toISOString().slice(0, 16)}
          required
          readOnly={readOnly}
          className="rounded-lg"
        />

        <Input
          name="origen"
          label="Origen"
          placeholder="Origen del movimiento"
          defaultValue={movimiento?.origen || "Sistema"}
          required
          readOnly={readOnly}
          className="rounded-lg"
        />
      </div>

      {selectedTipoMovimiento === "TRASLADO" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            name="almacenOrigenId"
            label="Almacén origen"
            placeholder="Seleccione almacén origen"
            isDisabled={readOnly}
            className="rounded-lg"
          >
            {almacenes.map((almacen) => (
              <SelectItem key={almacen.id} textValue={almacen.nombre}>
                {almacen.nombre}
              </SelectItem>
            ))}
          </Select>

          <Select
            name="almacenDestinoId"
            label="Almacén destino"
            placeholder="Seleccione almacén destino"
            isDisabled={readOnly}
            className="rounded-lg"
          >
            {almacenes.map((almacen) => (
              <SelectItem key={almacen.id} textValue={almacen.nombre}>
                {almacen.nombre}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {!hideFooter && (
        <div className="flex justify-end gap-3 mt-4">
          {renderFooter()}
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirm}
        title={`Confirmar ${action}`}
        message={`¿Está seguro de que desea ${action} este movimiento?`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
      />
    </Form>
  );
};