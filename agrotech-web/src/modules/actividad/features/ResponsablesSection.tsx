import {
  Button,
  Input,
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
} from "@heroui/react";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useFieldArray, Controller } from "react-hook-form";
import type { CreateActividadPayload } from "../models/types";
import { Plus, Trash2 } from "lucide-react";

interface ResponsablesSectionProps {
  control: Control<CreateActividadPayload>;
  setValue: UseFormSetValue<CreateActividadPayload>;
  watch: UseFormWatch<CreateActividadPayload>;
  usuarios: any[];
}

export default function ResponsablesSection({
  control,
  setValue,
  watch,
  usuarios,
}: ResponsablesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "responsables",
  });

  // Watch the form values instead of using local state
  const horasActividad = watch("horasActividad") || 0;
  const precioHoraActividad = watch("precioHoraActividad") || 0;

  const handleAdd = () => {
    append({
      usuarioId: 0,
      horas: horasActividad,
      precioHora: precioHoraActividad,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-end gap-4 p-4 rounded-lg border border-green-50 bg-green-50/30">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Controller
            name="horasActividad"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <Input
                type="number"
                label="Horas por defecto"
                placeholder="0"
                value={field.value?.toString() || "0"}
                onValueChange={(v) => field.onChange(Number(v) || 0)}
                size="sm"
                variant="bordered"
                description="Se aplicará a todos los responsables"
                classNames={{
                  label: "text-green-800 font-medium",
                  inputWrapper: "bg-white hover:border-green-500",
                }}
              />
            )}
          />
          <Controller
            name="precioHoraActividad"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <Input
                type="number"
                label="Precio/Hora por defecto"
                placeholder="0"
                startContent={<span className="text-xs text-green-700">$</span>}
                value={field.value?.toString() || "0"}
                onValueChange={(v) => field.onChange(Number(v) || 0)}
                size="sm"
                variant="bordered"
                description="Se aplicará a todos los responsables"
                classNames={{
                  label: "text-green-800 font-medium",
                  inputWrapper: "bg-white hover:border-green-500",
                }}
              />
            )}
          />
        </div>
        <Button
          color="success"
          className="text-white shadow-md"
          startContent={<Plus className="w-4 h-4" />}
          onPress={handleAdd}
        >
          Agregar Responsable
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-gray-500 text-sm italic text-center py-4">
          No hay responsables asignados.
        </p>
      )}

      <div className="grid gap-3">
        {fields.map((field, index) => (
          <Card key={field.id} shadow="sm" className="border border-green-100">
            <CardBody className="flex flex-col md:flex-row gap-3 items-center justify-between p-3">
              <div className="flex-1 w-full">
                <Controller
                  name={`responsables.${index}.usuarioId`}
                  control={control}
                  rules={{ required: "Usuario requerido" }}
                  render={({ field: f, fieldState }) => (
                    <Autocomplete
                      defaultItems={usuarios}
                      label="Usuario"
                      placeholder="Busque por nombre o identificación"
                      variant="bordered"
                      size="sm"
                      selectedKey={f.value ? String(f.value) : null}
                      onSelectionChange={(key) => f.onChange(Number(key))}
                      errorMessage={fieldState.error?.message}
                      isInvalid={!!fieldState.error}
                      defaultFilter={(textValue, inputValue) => {
                        return textValue
                          .toLowerCase()
                          .includes(inputValue.toLowerCase());
                      }}
                    >
                      {(u) => (
                        <AutocompleteItem
                          key={String(u.id)}
                          textValue={`${u.nombre} ${u.apellido} - ${u.identificacion}`}
                        >
                          <div className="flex flex-col">
                            <span className="text-small">
                              {u.nombre} {u.apellido}
                            </span>
                            <span className="text-tiny text-default-400">
                              ID: {u.identificacion}
                            </span>
                          </div>
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  )}
                />
              </div>

              {/* Display values as text instead of inputs */}
              <div className="flex gap-6 items-center px-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Horas
                  </span>
                  <span className="font-medium text-gray-700">
                    {control._formValues.responsables?.[index]?.horas || 0}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Precio/Hora
                  </span>
                  <span className="font-medium text-gray-700">
                    $
                    {control._formValues.responsables?.[index]?.precioHora || 0}
                  </span>
                </div>
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
