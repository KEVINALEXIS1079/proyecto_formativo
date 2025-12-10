import { Button, Input, Card, CardBody } from "@heroui/react";
import type { Control } from "react-hook-form";
import { useFieldArray, Controller } from "react-hook-form";
import type { ActividadFormData } from "../models/schemas";
import { Plus, Trash2 } from "lucide-react";

interface ServiciosSectionProps {
  control: Control<ActividadFormData>;
}

export default function ServiciosSection({ control }: ServiciosSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "servicios",
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Servicios y Maquinaria</h3>
        <Button
          size="sm"
          color="success"
          className="text-white"
          startContent={<Plus className="w-4 h-4" />}
          onPress={() =>
            append({
              nombreServicio: "",
              horas: 0,
              precioHora: 0,
            })
          }
        >
          Agregar Servicio
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-gray-500 text-sm italic">
          No hay servicios agregados.
        </p>
      )}

      <div className="grid gap-3">
        {fields.map((field, index) => (
          <Card key={field.id} shadow="sm" className="border border-gray-200">
            <CardBody className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Controller
                  name={`servicios.${index}.nombreServicio`}
                  control={control}
                  rules={{ required: "Nombre requerido" }}
                  render={({ field: f, fieldState }) => (
                    <Input
                      {...f}
                      label="Nombre del Servicio / Maquinaria"
                      placeholder="Ej. Tractor, Guadaña"
                      errorMessage={fieldState.error?.message}
                      isInvalid={!!fieldState.error}
                      variant="bordered"
                      size="sm"
                    />
                  )}
                />
              </div>

              <div className="w-full md:w-32">
                <Controller
                  name={`servicios.${index}.horas`}
                  control={control}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      value={f.value?.toString() || ""}
                      type="number"
                      label="Horas Uso"
                      placeholder="0"
                      variant="bordered"
                      size="sm"
                      onChange={(e) => f.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>

              <div className="w-full md:w-32">
                <Controller
                  name={`servicios.${index}.precioHora`}
                  control={control}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      value={f.value?.toString() || ""}
                      type="number"
                      label="Precio/Hora"
                      placeholder="0"
                      variant="bordered"
                      size="sm"
                      startContent={<span className="text-xs">$</span>}
                      onChange={(e) => f.onChange(Number(e.target.value))}
                    />
                  )}
                />
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
        ))}
      </div>
    </div>
  );
}
