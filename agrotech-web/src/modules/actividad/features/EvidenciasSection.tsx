import { Button, Input, Card, CardBody, Image } from "@heroui/react";
import type { Control } from "react-hook-form";
import { useFieldArray, Controller } from "react-hook-form";
import type { ActividadFormData } from "../models/schemas";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { uploadFile } from "../api/upload";
import toast from "react-hot-toast";

interface EvidenciasSectionProps {
  control: Control<ActividadFormData>;
}

export default function EvidenciasSection({ control }: EvidenciasSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "evidencias",
  });

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (
    file: File,
    _index: number,
    onChange: (value: string[]) => void,
    currentImages: string[]
  ) => {
    try {
      setUploading(true);
      const url = await uploadFile(file);
      onChange([...currentImages, url]);
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Evidencias</h3>
        <Button
          size="sm"
          color="success"
          className="text-white"
          startContent={<Plus className="w-4 h-4" />}
          onPress={() => append({ descripcion: "", imagenes: [] })}
        >
          Agregar Evidencia
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-gray-500 text-sm italic">
          No hay evidencias agregadas.
        </p>
      )}

      <div className="grid gap-3">
        {fields.map((field, index) => (
          <Card key={field.id} shadow="sm" className="border border-gray-200">
            <CardBody className="flex flex-col gap-3">
              <Controller
                name={`evidencias.${index}.descripcion`}
                control={control}
                rules={{ required: "Descripción requerida" }}
                render={({ field: f, fieldState }) => (
                  <Input
                    {...f}
                    label="Descripción"
                    placeholder="Describa la evidencia"
                    errorMessage={fieldState.error?.message}
                    isInvalid={!!fieldState.error}
                    variant="bordered"
                    size="sm"
                  />
                )}
              />

              <Controller
                name={`evidencias.${index}.imagenes`}
                control={control}
                render={({ field: f }) => (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(f.value || []).map((img, imgIndex) => (
                        <div key={`${img}-${imgIndex}`} className="relative group">
                          <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                            <Image
                              src={`http://localhost:4000${img}`} // Adjust base URL
                              alt="Evidencia"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newImages = [...(f.value || [])];
                              newImages.splice(imgIndex, 1);
                              f.onChange(newImages);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        id={`file-upload-${index}`}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(
                              e.target.files[0],
                              index,
                              f.onChange,
                              f.value || []
                            );
                            e.target.value = ''; // Reset input after upload attempt
                          }
                        }}
                      />
                      <label htmlFor={`file-upload-${index}`}>
                        <Button
                          as="span"
                          size="sm"
                          variant="flat"
                          color="success"
                          disabled={uploading}
                          startContent={<Upload className="w-4 h-4" />}
                        >
                          {uploading ? "Subiendo..." : "Subir Imagen"}
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              />

              <div className="flex justify-end">
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => remove(index)}
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  Eliminar
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
