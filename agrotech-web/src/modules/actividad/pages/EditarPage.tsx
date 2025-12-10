import { useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Card } from "@heroui/react";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";

import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import type { CreateActividadPayload } from "../models/types";
import ActividadForm from "../ui/ActividadForm";
import { useActividad, useUpdateActividad } from "../hooks/useActividades";

export default function EditarPage() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const { id } = useParams();
  const actividadId = Number(id);

  const { data: actividad, isLoading: isLoadingData } =
    useActividad(actividadId);
  const updateMutation = useUpdateActividad();

  useEffect(() => setTitle("Editar Actividad"), [setTitle]);

  const handleSubmit = async (data: CreateActividadPayload) => {
    try {
      await updateMutation.mutateAsync({ id: actividadId, data });
      toast.success("Actividad actualizada exitosamente");
      navigate("/actividades");
    } catch (err: any) {
      console.error(err);
      toast.error("Error al actualizar la actividad");
    }
  };

  if (isLoadingData) {
    return (
      <div className="p-8 text-center">Cargando datos de la actividad...</div>
    );
  }

  if (!actividad) {
    return <div className="p-8 text-center">Actividad no encontrada</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-y-auto h-[calc(100vh-10rem)]">
      <Card className="p-8 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-8">
          <Pencil className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Editar Actividad</h2>
        </div>

        <ActividadForm
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          initialData={actividad}
          submitLabel="Guardar Cambios"
        />
      </Card>
    </div>
  );
}
