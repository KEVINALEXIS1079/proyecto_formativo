import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
} from "@heroui/react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { finalizarActividadSchema, type FinalizarActividadData } from "../models/schemas";
import { useFinalizeActividad } from "../hooks/useActividades";
import { format } from "date-fns";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface FinalizeActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  actividad: any;
}

export default function FinalizeActivityModal({
  isOpen,
  onClose,
  actividad,
}: FinalizeActivityModalProps) {
  const mutation = useFinalizeActividad();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FinalizarActividadData>({
    resolver: zodResolver(finalizarActividadSchema) as any,
    defaultValues: {
      fechaReal: new Date(),
      insumosReales: [],
      produccion: { cantidad: 0, unidad: "Kg" },
    },
  });

  const { fields: insumosFields, replace } = useFieldArray({
    control,
    name: "insumosReales",
  });

  // Load reserved insumos on open
  useEffect(() => {
    if (isOpen && actividad) {
      reset({
        fechaReal: new Date(),
        produccion: { cantidad: 0, unidad: "Kg" },
        insumosReales: [], // Reset first
      });

      if (actividad.insumosReserva) {
        const reservas = actividad.insumosReserva.map((r: any) => ({
          insumoId: r.insumoId,
          nombre: r.insumo?.nombre, // Helper for UI
          cantidad: r.cantidadReservada,
          unidad: r.insumo?.unidadUso,
        }));
        replace(reservas);
      }
    }
  }, [isOpen, actividad, reset, replace]);

  const onSubmit = async (data: FinalizarActividadData) => {
    try {
      await mutation.mutateAsync({
        id: actividad.id,
        payload: {
          fechaReal: data.fechaReal,
          insumosReales: data.insumosReales.map(i => ({
            insumoId: i.insumoId,
            cantidad: i.cantidad,
          })),
          produccion:
            (actividad.tipo === "COSECHA" || actividad.subtipo === "COSECHA") && data.produccion?.cantidad
              ? data.produccion
              : undefined,
        },
      });
      toast.success("Actividad finalizada correctamente");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al finalizar actividad");
    }
  };

  if (!actividad) return null;

  const isCosecha = actividad.tipo === "COSECHA" || actividad.subtipo === "COSECHA";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              Finalizar Actividad
              <p className="text-sm font-normal text-gray-500">
                Confirme los recursos realmente utilizados y finalice la actividad.
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="fechaReal"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Fecha de Finalización"
                      type="date"
                      value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                      onChange={(e) => field.onChange(e.target.valueAsDate)}
                      errorMessage={errors.fechaReal?.message}
                      isInvalid={!!errors.fechaReal}
                    />
                  )}
                />

                {/* Insumos */}
                {insumosFields.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Confirmar Insumos (Real)</h4>
                    <div className="space-y-2">
                       {insumosFields.map((field, index) => (
                         <div key={field.id} className="flex gap-2 items-center">
                           <div className="flex-1">
                             <Input
                               label={(field as any).nombre || `Insumo ID ${field.insumoId}`}
                               isDisabled
                               size="sm"
                               value="Insumo" // Placeholder or managed via field name
                             />
                           </div>
                           <div className="w-32">
                             <Controller
                               name={`insumosReales.${index}.cantidad`}
                               control={control}
                               render={({ field: qtyField }) => (
                                 <Input
                                   {...qtyField}
                                   value={String(qtyField.value ?? 0)}
                                   type="number"
                                   label="Cant. Real"
                                   variant="bordered"
                                   size="sm"
                                   onChange={(e) => qtyField.onChange(Number(e.target.value))}
                                 />
                               )} 
                             />
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Cosecha */}
                {isCosecha && (
                   <Card className="bg-orange-50 border-orange-200">
                     <CardBody>
                       <h4 className="font-bold text-orange-800 mb-2">Registro de Producción</h4>
                       <div className="flex gap-4">
                          <Controller
                            name="produccion.cantidad"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                value={String(field.value ?? 0)}
                                type="number"
                                label="Cantidad Obtenida"
                                placeholder="0.00"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                          <Controller
                            name="produccion.unidad"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label="Unidad"
                                placeholder="Kg"
                              />
                            )}
                          />
                       </div>
                     </CardBody>
                   </Card>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="success" type="submit" isLoading={mutation.isPending}>
                Finalizar Actividad
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
