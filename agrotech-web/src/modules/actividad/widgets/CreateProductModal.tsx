import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { createProductoAgro } from "../api";
import { Save } from "lucide-react";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProduct: any) => void;
}

interface ProductFormData {
  nombre: string;
  unidadBase: string;
  descripcion: string;
}

export default function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm<ProductFormData>({
    defaultValues: {
      nombre: "",
      unidadBase: "kg",
      descripcion: "",
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      // Fix Typo in backend DTO if exists, but assuming 'unidadBase' matches entity
      const newProduct = await createProductoAgro({
        nombre: data.nombre,
        unidadMedida: data.unidadBase,
        descripcion: data.descripcion
      });
      toast.success("Producto creado exitosamente");
      onSuccess(newProduct);
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">Registrar Nuevo Producto</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="nombre"
                  control={control}
                  rules={{ required: "El nombre es requerido" }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      label="Nombre del Producto"
                      placeholder="Ej. Papaya Hawaiana"
                      variant="bordered"
                      errorMessage={fieldState.error?.message}
                      isInvalid={!!fieldState.error}
                    />
                  )}
                />

                <Controller
                  name="unidadBase"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Unidad Base"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                      variant="bordered"
                    >
                      <SelectItem key="kg">Kilogramos (kg)</SelectItem>
                      <SelectItem key="g">Gramos (g)</SelectItem>
                      <SelectItem key="lb">Libras (lb)</SelectItem>
                      <SelectItem key="ton">Toneladas (ton)</SelectItem>
                      <SelectItem key="un">Unidades (un)</SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="descripcion"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Descripción"
                      placeholder="Detalles adicionales..."
                      variant="bordered"
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
                Guardar
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
