import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { productionApi, type LoteProduccion } from "../api/production.service";
import { Save } from "lucide-react";

interface EditLoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lote: LoteProduccion | null;
  onSuccess: () => void;
}

interface EditLoteFormData {
  calidad: string;
  precioSugeridoKg: number;
}

const CALIDADES = ["PREMIUM", "ESTANDAR", "SEGUNDA", "INDUSTRIAL"];

export default function EditLoteModal({ isOpen, onClose, lote, onSuccess }: EditLoteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, reset, setValue } = useForm<EditLoteFormData>({
    defaultValues: {
      calidad: "ESTANDAR",
      precioSugeridoKg: 0,
    }
  });

  useEffect(() => {
    if (lote) {
      setValue("calidad", lote.calidad || "ESTANDAR");
      setValue("precioSugeridoKg", lote.precioSugeridoKg || 0);
    }
  }, [lote, setValue]);

  const onSubmit = async (data: EditLoteFormData) => {
    if (!lote) return;
    setIsLoading(true);
    try {
      await productionApi.updateLote(lote.id, {
        calidad: data.calidad,
        precioSugeridoKg: Number(data.precioSugeridoKg),
      });
      toast.success("Lote actualizado exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el lote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
                Editar Lote #{lote?.id} - {lote?.productoAgro?.nombre}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="calidad"
                  control={control}
                  rules={{ required: "La calidad es requerida" }}
                  render={({ field, fieldState }) => (
                    <Select
                      label="Calidad / Clasificación"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                      variant="bordered"
                      color="primary"
                      errorMessage={fieldState.error?.message}
                      isInvalid={!!fieldState.error}
                    >
                      {CALIDADES.map((c) => (
                        <SelectItem key={c}>{c}</SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="precioSugeridoKg"
                  control={control}
                  rules={{ required: "El precio es requerido", min: 0 }}
                  render={({ field, fieldState }) => (
                    <Input
                      type="number"
                      label="Precio Sugerido (por Kg)"
                      placeholder="0.00"
                      variant="bordered"
                      startContent={<span className="text-default-400">$</span>}
                      errorMessage={fieldState.error?.message}
                      isInvalid={!!fieldState.error}
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(Number(val) || 0)}
                    />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="success" type="submit" isLoading={isLoading} startContent={<Save size={18} />}>
                Guardar Cambios
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
