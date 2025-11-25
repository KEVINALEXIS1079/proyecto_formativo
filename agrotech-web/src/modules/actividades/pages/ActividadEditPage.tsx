import { useParams, useNavigate } from "react-router-dom";
import { useActividadById } from "../hooks/useActividadById";
import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";
import ActividadForm from "../widgets/ActividadForm";

export default function ActividadEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const actividadId = id ? parseInt(id) : 0;

  const { data: actividad, isLoading } = useActividadById(actividadId);

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (!actividad) {
    return <div className="p-4">Actividad no encontrada</div>;
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="flat"
          onPress={() => navigate(-1)}
          startContent={<ArrowLeft />}
        >
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Editar Actividad</h1>
      </div>

      <ActividadForm actividad={actividad} />
    </div>
  );
}