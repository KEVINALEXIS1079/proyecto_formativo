
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Form } from "@heroui/form";
import type { CreateCategoriaInsumoInput, UpdateCategoriaInsumoInput } from "../model/types";

interface CategoriaFormProps {
  initialValues?: Partial<CreateCategoriaInsumoInput & UpdateCategoriaInsumoInput>;
  onSubmit: (data: CreateCategoriaInsumoInput | UpdateCategoriaInsumoInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

export default function CategoriaForm({
  initialValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Guardar",
  isEdit = !!initialValues?.nombre
}: CategoriaFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      nombre: formData.get("nombre") as string,
      descripcion: (formData.get("descripcion") as string) || undefined,
      tipoInsumo: (formData.get("tipoInsumo") as any) || 'CONSUMIBLE',
    };

    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 p-6 bg-white rounded-xl shadow-lg">
      <div className="grid grid-cols-1 gap-4">
        <Input
          name="nombre"
          label="Nombre de la categoría"
          placeholder="Ingrese el nombre"
          defaultValue={initialValues?.nombre}
          required
          className="rounded-lg"
        />
        <Select
          name="tipoInsumo"
          label="Tipo de Categoría"
          placeholder="Seleccione el tipo"
          defaultSelectedKeys={initialValues?.tipoInsumo ? [initialValues.tipoInsumo] : ['CONSUMIBLE']}
          required
          className="rounded-lg"
        >
          <SelectItem key="CONSUMIBLE" textValue="Consumible (Semillas, Fertilizantes)">
            Consumible (Semillas, Fertilizantes)
          </SelectItem>
          <SelectItem key="NO_CONSUMIBLE" textValue="No Consumible (Herramientas, Maquinaria)">
            No Consumible (Herramientas, Maquinaria)
          </SelectItem>
        </Select>
        <Input
          name="descripcion"
          label="Descripción"
          placeholder="Ingrese la descripción (opcional)"
          defaultValue={initialValues?.descripcion}
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