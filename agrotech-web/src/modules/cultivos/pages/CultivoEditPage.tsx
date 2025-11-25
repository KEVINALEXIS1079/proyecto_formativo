import { useParams } from "react-router-dom";
import { useCultivoDetail } from "../hooks/useCultivos";
import CultivoForm from "../widgets/CultivoForm";

export default function CultivoEditPage() {
  const { id } = useParams<{ id: string }>();
  const cultivoId = Number(id);

  const { data: cultivo, isLoading } = useCultivoDetail(cultivoId);

  if (isLoading) return <div className="p-6">Cargando…</div>;
  if (!cultivo) return <div className="p-6">Cultivo no encontrado</div>;

  return (
    <div className="p-6">
      <CultivoForm cultivo={cultivo} />
    </div>
  );
}