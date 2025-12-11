import { useParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { useCultivoDetail } from "../hooks/useCultivos";
import CultivoForm from "../widgets/CultivoForm";

export default function CultivoEditPage() {
  const { id } = useParams<{ id: string }>();
  const cultivoId = Number(id);

  const { data: cultivo, isLoading } = useCultivoDetail(cultivoId);

  if (isLoading) return (
    <div className="flex justify-center p-6">
      <Spinner color="success" label="Cargando..." />
    </div>
  );
  if (!cultivo) return <div className="p-6">Cultivo no encontrado</div>;

  return (
    <div className="p-6">
      <CultivoForm cultivo={cultivo} />
    </div>
  );
}