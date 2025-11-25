import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateInsumo } from "../hooks/useCreateInsumo";
import { useUploadInsumoImage } from "../hooks/useUploadInsumoImage";
import { ArrowLeft } from "lucide-react";
import InsumoForm from "../ui/widgets/InsumoForm";
import type { CreateInsumoInput } from "../model/types";

export default function CrearInsumoPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createMutation = useCreateInsumo();
  const uploadMutation = useUploadInsumoImage();

  const handleSubmit = (data: CreateInsumoInput | any) => {
    createMutation.mutate(data, {
      onSuccess: (result) => {
        const insumoId = result.id;
        if (selectedFile) {
          uploadMutation.mutate(
            { id: insumoId, file: selectedFile },
            {
              onSuccess: () => {
                navigate(`/inventario/${insumoId}`);
              },
            }
          );
        } else {
          navigate(`/inventario/${insumoId}`);
        }
      },
    });
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const initialValues = {
    fechaIngreso: new Date().toISOString().split('T')[0],
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Volver"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">Crear Insumo</h1>
      </div>
      <InsumoForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange}
        isLoading={createMutation.isPending || uploadMutation.isPending}
        submitLabel="Crear"
      />
    </div>
  );
}