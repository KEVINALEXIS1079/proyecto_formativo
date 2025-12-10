import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCategoria } from "../hooks/useCreateCategoria";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import CategoriaForm from "../ui/widgets/CategoriaForm";
import type { CreateCategoriaInsumoInput } from "../model/types";

export default function CrearCategoriaPage() {
  const navigate = useNavigate();
  const createMutation = useCreateCategoria();

  const handleSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: (result) => {
        toast.success("Categoría creada correctamente");
        navigate(`/inventario/categorias/${result.id}`);
      },
    });
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
        <h1 className="text-3xl font-bold">Crear Categoría</h1>
      </div>
      <CategoriaForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Crear"
        isEdit={false}
      />
    </div>
  );
}