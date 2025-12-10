import { useNavigate } from "react-router-dom";
import { useCreateProveedor } from "../hooks/useCreateProveedor";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import ProveedorForm from "../ui/widgets/ProveedorForm";
import type { CreateProveedorInput } from "../model/types";

export default function CrearProveedorPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProveedor();

  const handleSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: (result) => {
        toast.success("Proveedor creado correctamente");
        navigate(`/inventario/proveedores/${result.id}`);
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
        <h1 className="text-3xl font-bold">Crear Proveedor</h1>
      </div>
      <ProveedorForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Crear"
        isEdit={false}
      />
    </div>
  );
}