import CultivoForm from "../widgets/CultivoForm";

import { useNavigate } from "react-router-dom";
import { useCultivoCreate } from "../hooks/useCultivos";

export default function CultivoCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCultivoCreate();

  const handleSubmit = (data: any) => {
      createMutation.mutate(data, {
          onSuccess: () => navigate("/cultivos")
      });
  };

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Registrar Nuevo Cultivo</h1>
      <CultivoForm 
         onSubmit={handleSubmit}
         onCancel={() => navigate("/cultivos")}
         isLoading={createMutation.isPending}
      />
    </div>
  );
}