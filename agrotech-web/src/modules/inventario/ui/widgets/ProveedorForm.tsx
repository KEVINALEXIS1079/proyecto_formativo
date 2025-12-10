import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import type { CreateProveedorInput, UpdateProveedorInput } from "../../model/types";

interface ProveedorFormProps {
  initialValues?: Partial<CreateProveedorInput & UpdateProveedorInput>;
  onSubmit: (data: CreateProveedorInput | UpdateProveedorInput) => void;
  onClose?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

export default function ProveedorForm({
  initialValues,
  onSubmit,
  onClose,
  isLoading = false,
  submitLabel = "Guardar",
  isEdit = !!initialValues?.nombre
}: ProveedorFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      nombre: formData.get("nombre") as string,
    };

    console.log("DEBUG: Datos enviados desde ProveedorForm:", data);
    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-4">
        <Input
          name="nombre"
          label="Nombre del proveedor"
          placeholder="Ingrese el nombre"
          defaultValue={initialValues?.nombre}
          required
          className="rounded-lg"
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        {onClose && (
          <Button type="button" variant="flat" onPress={onClose} className="px-6 py-2 rounded-lg">
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          color="success"
          isLoading={isLoading}
          className="px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow text-black font-semibold"
        >
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}