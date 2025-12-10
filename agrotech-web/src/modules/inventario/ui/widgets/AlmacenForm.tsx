import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import type { CreateAlmacenInput, UpdateAlmacenInput } from "../../model/types";

interface AlmacenFormProps {
  initialValues?: Partial<CreateAlmacenInput & UpdateAlmacenInput>;
  onSubmit: (data: CreateAlmacenInput | UpdateAlmacenInput) => void;
  onClose?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function AlmacenForm({
  initialValues,
  onSubmit,
  onClose,
  isLoading = false,
  submitLabel = "Guardar",
}: AlmacenFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      nombre: formData.get("nombre") as string,
      descripcion: (formData.get("descripcion") as string) || undefined,
    };

    console.log("DEBUG: Datos enviados desde AlmacenForm:", data);
    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-4">
        <Input
          name="nombre"
          label="Nombre del almacén"
          placeholder="Ingrese el nombre"
          defaultValue={initialValues?.nombre}
          required
          className="rounded-lg"
        />
        <Input
          name="descripcion"
          label="Descripción"
          placeholder="Ingrese la descripción (opcional)"
          defaultValue={initialValues?.descripcion}
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