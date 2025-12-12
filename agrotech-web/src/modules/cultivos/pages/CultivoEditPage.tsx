import { useParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { useCultivoDetail } from "../hooks/useCultivos";
import CultivoForm from "../widgets/CultivoForm";

import { useNavigate } from "react-router-dom";
import { useCultivoUpdate } from "../hooks/useCultivos";

export default function CultivoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cultivoId = Number(id);

  const { data: cultivo, isLoading } = useCultivoDetail(cultivoId);
  const updateMutation = useCultivoUpdate();

  if (isLoading) return (
    <div className="flex justify-center p-6">
      <Spinner color="success" label="Cargando..." />
    </div>
  );
  if (!cultivo) return <div className="p-6">Cultivo no encontrado</div>;

  const handleSubmit = (data: any) => {
      updateMutation.mutate({ id: cultivoId, dto: data }, {
          onSuccess: () => navigate("/cultivos")
      });
  };

  return (
    <div className="p-6">
      <CultivoForm 
        initialData={cultivo} 
        onSubmit={handleSubmit}
        onCancel={() => navigate("/cultivos")}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}