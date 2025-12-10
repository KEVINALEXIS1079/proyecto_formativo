import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card } from "@heroui/react";
import { ListChecks } from "lucide-react";
import toast from "react-hot-toast";

import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import type { CreateActividadPayload } from "../models/types";
import ActividadForm from "../ui/ActividadForm";
import { useCreateActividad } from "../hooks/useActividades";

export default function CrearPage() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const createMutation = useCreateActividad();

  useEffect(() => setTitle("Registrar Actividad"), [setTitle]);

  const handleSubmit = async (data: CreateActividadPayload) => {
    try {
      console.log("Submitting activity data:", data);

      // Send all data in a single request
      // The backend accepts responsables, insumos, servicios, and evidencias in the initial payload
      await createMutation.mutateAsync(data);

      toast.success("Actividad creada exitosamente");
      navigate("/actividades");
    } catch (err: any) {
      console.error("Error creating activity:", err);
      toast.error(err.response?.data?.message || "Error al crear la actividad");
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-y-auto h-[calc(100vh-10rem)]">
      <Card className="p-8 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-8">
          <ListChecks className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Registrar Actividad
          </h2>
        </div>

        <ActividadForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          submitLabel="Registrar"
        />
      </Card>
    </div>
  );
}
