import {
  Button,
  Select,
  SelectItem,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
} from "@heroui/react";
import type { Control } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import type { ActividadFormData } from "../models/schemas";
import { Plus, Trash2, Info, CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";

interface InsumoOption {
  id: number;
  nombre: string;
  stockUso: number;
  unidadUso: string;
  precioUnitarioUso: number;
  almacen?: any;
  stockPresentacion?: number;
  presentacionUnidad?: string;
}

interface InsumosSectionProps {
  control: Control<ActividadFormData>;
  insumos: InsumoOption[];
  isReservationMode?: boolean;
}

export default function InsumosSection({
  control,
  insumos,
  isReservationMode = false,
}: InsumosSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "insumos",
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Local state for the "Add Insumo" form
  const [selectedInsumoId, setSelectedInsumoId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [costoUnitario, setCostoUnitario] = useState<number>(0);

  // State for pending insumos (not yet confirmed)
  const [pendingInsumos, setPendingInsumos] = useState<any[]>([]);
  const [consumoDescripcion, setConsumoDescripcion] = useState<string>("");

  const selectedInsumo = useMemo(
    () => insumos.find((i) => i.id === selectedInsumoId),
    [selectedInsumoId, insumos]
  );

  // Add to pending list with stock validation
  const handleAddToPending = () => {
    if (selectedInsumoId && cantidad > 0) {
      const insumo = insumos.find((i) => i.id === selectedInsumoId);

      // Validate stock availability
      if (insumo && cantidad > insumo.stockUso) {
        // Use dynamic import for toast
        import("react-hot-toast").then(({ default: toast }) => {
          toast.error(
            `Stock insuficiente. Disponible: ${insumo.stockUso} ${insumo.unidadUso}`,
            {
              duration: 4000,
              position: "top-center",
            }
          );
        });
        return; // Don't add to pending
      }

      setPendingInsumos([
        ...pendingInsumos,
        {
          id: Date.now(), // Temporary ID
          insumoId: selectedInsumoId,
          cantidadUso: cantidad,
          costoUnitarioUso: costoUnitario,
          insumoData: insumo, // Store for display
        },
      ]);
      // Reset form
      setSelectedInsumoId(null);
      setCantidad(0);
      setCostoUnitario(0);
    }
  };

  // Remove from pending list
  const handleRemovePending = (id: number) => {
    setPendingInsumos(pendingInsumos.filter((p) => p.id !== id));
  };

  // Confirm all pending insumos
  const handleConfirm = () => {
    if (pendingInsumos.length > 0) {
      onOpen(); // Show confirmation modal
    }
  };

  // Final confirmation - add all to form
  const confirmAllInsumos = () => {
    if (!consumoDescripcion.trim()) {
      return; // Description is required
    }

    // Add all pending insumos to the form with the same description
    pendingInsumos.forEach((pending) => {
      append({
        insumoId: pending.insumoId,
        cantidadUso: pending.cantidadUso,
        costoUnitarioUso: pending.costoUnitarioUso,
        descripcion: consumoDescripcion.trim(),
      });
    });

    // Clear pending list and description
    setPendingInsumos([]);
    setConsumoDescripcion("");
    onOpenChange(); // Close modal
  };

  return (
    <div className="space-y-6">
      {/* Add Insumo Form */}
      <div className="p-4 rounded-lg border border-green-50 space-y-4">
        <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
          <Plus className="w-4 h-4" /> {isReservationMode ? "Planificar/Reservar Insumo" : "Agregar Insumo"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Seleccionar Insumo"
            placeholder="Busque un insumo"
            selectedKeys={selectedInsumoId ? [String(selectedInsumoId)] : []}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSelectedInsumoId(val);
              // Auto-set cost if available
              const ins = insumos.find((i) => i.id === val);
              if (ins) setCostoUnitario(ins.precioUnitarioUso || 0);
            }}
            variant="bordered"
            size="sm"
          >
            {insumos.map((i) => (
              <SelectItem key={String(i.id)} textValue={i.nombre}>
                <div className="flex flex-col">
                  <span className="font-medium">{i.nombre}</span>
                  <span className="text-tiny text-gray-500">
                    {i.almacen?.nombre || "Sin almacén"} | Stock:{" "}
                    {i.stockPresentacion} {i.presentacionUnidad} ({i.stockUso}{" "}
                    {i.unidadUso})
                  </span>
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>

        {selectedInsumo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Cantidad a Usar"
              placeholder="0"
              value={cantidad.toString()}
              onValueChange={(v) => setCantidad(Number(v))}
              endContent={
                <span className="text-xs text-gray-500">
                  {selectedInsumo.unidadUso}
                </span>
              }
              variant="bordered"
              size="sm"
            />
            <Input
              type="number"
              label="Costo Unitario (Uso)"
              value={costoUnitario.toString()}
              isReadOnly
              variant="flat"
              color="success"
              size="sm"
              startContent={<span className="text-xs">$</span>}
              description={`Valor Total: $${(
                cantidad * costoUnitario
              ).toLocaleString()}`}
            />
          </div>
        )}

        {selectedInsumo && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-lg border border-gray-200">
            <p>
              <strong>Almacén:</strong> {selectedInsumo.almacen?.nombre}
            </p>
            <p>
              <strong>Stock Presentación:</strong>{" "}
              {selectedInsumo.stockPresentacion}{" "}
              {selectedInsumo.presentacionUnidad}
            </p>
            <p>
              <strong>Stock Total (Uso):</strong> {selectedInsumo.stockUso}{" "}
              {selectedInsumo.unidadUso}
            </p>
            <p>
              <strong>Precio Unitario (Uso):</strong> $
              {selectedInsumo.precioUnitarioUso} / {selectedInsumo.unidadUso}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            color="success"
            variant="flat"
            isDisabled={!selectedInsumoId || cantidad <= 0}
            onPress={handleAddToPending}
          >
            Añadir fila
          </Button>
        </div>
      </div>

      {/* Pending Insumos List */}
      {pendingInsumos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-orange-600">
              Insumos pendientes de confirmar ({pendingInsumos.length})
            </h3>
          </div>

          <div className="grid gap-3">
            {pendingInsumos.map((pending) => (
              <Card
                key={pending.id}
                shadow="sm"
                className="border border-orange-200 bg-orange-50/30"
              >
                <CardBody className="flex flex-row justify-between items-center p-3">
                  <div>
                    <p className="font-medium text-gray-800">
                      {pending.insumoData?.nombre || "Insumo desconocido"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cantidad: {pending.cantidadUso}{" "}
                      {pending.insumoData?.unidadUso} | Costo: $
                      {pending.costoUnitarioUso}
                    </p>
                  </div>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    size="sm"
                    onPress={() => handleRemovePending(pending.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              color="success"
              className="text-white"
              startContent={<CheckCircle className="w-4 h-4" />}
              onPress={handleConfirm}
            >
              Confirmar Insumos ({pendingInsumos.length})
            </Button>
          </div>
        </div>
      )}

      {/* Confirmed Insumos List */}
      {fields.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-green-600">
            Insumos confirmados ({fields.length})
          </h3>
          <div className="grid gap-3">
            {fields.map((field, index) => {
              const insumo = insumos.find((i) => i.id === field.insumoId);
              return (
                <Card
                  key={field.id}
                  shadow="sm"
                  className="border border-green-100"
                >
                  <CardBody className="flex flex-row justify-between items-center p-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        {insumo?.nombre || "Insumo desconocido"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {field.cantidadUso} {insumo?.unidadUso} |
                        Costo: ${field.costoUnitarioUso}
                      </p>
                    </div>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {fields.length === 0 && pendingInsumos.length === 0 && (
        <div className="text-center py-4 text-gray-400 italic">
          No se han agregado insumos a esta actividad.
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-warning-600">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5" /> Confirmar Movimiento de
                  Inventario
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p>
                    Estás a punto de confirmar{" "}
                    <strong>{pendingInsumos.length} insumo(s)</strong> para esta
                    actividad.
                  </p>

                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-semibold text-orange-800 mb-2">
                      Insumos a confirmar:
                    </p>
                    <ul className="space-y-1">
                      {pendingInsumos.map((pending) => (
                        <li key={pending.id} className="text-sm">
                          • <strong>{pending.insumoData?.nombre}</strong>:{" "}
                          {pending.cantidadUso} {pending.insumoData?.unidadUso}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-sm text-gray-600">
                    Esto representa un movimiento en inventario de tipo{" "}
                    <strong>{isReservationMode ? "RESERVA/COMPROMISO" : "CONSUMO"}</strong>.
                    {isReservationMode
                      ? " El stock se reservará (comprometerá) al guardar la actividad."
                      : " El stock se descontará al guardar la actividad."}
                  </p>

                  <Textarea
                    label="Descripción del consumo"
                    placeholder="Explique por qué se están usando estos insumos..."
                    value={consumoDescripcion}
                    onValueChange={setConsumoDescripcion}
                    variant="bordered"
                    minRows={3}
                    isRequired
                    description="Esta información se registrará en el movimiento de inventario"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="success"
                  className="text-white"
                  onPress={confirmAllInsumos}
                  isDisabled={!consumoDescripcion.trim()}
                >
                  Confirmar Todos
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
