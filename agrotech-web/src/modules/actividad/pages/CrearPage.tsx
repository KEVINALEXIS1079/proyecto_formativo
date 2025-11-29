import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card } from "@heroui/react";
import { ListChecks } from "lucide-react";

import type { LayoutContext } from "@/app/layout/ProtectedLayout";
import type { CreateActividadInput } from "../../actividades/model/types";
import ActividadForm from "../../actividades/ui/ActividadForm";
import { createActividad } from "../api";

export default function CrearPage() {
  const { setTitle } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();

  // título dinámico en el layout
  useEffect(() => setTitle("Registrar Actividad"), [setTitle]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: CreateActividadInput) => {
    setError("");
    try {
      setLoading(true);
      await createActividad(data);
      navigate("/actividades");
    } catch (err: any) {
      const msgBack =
        err?.response?.data?.message ?? "No se pudo crear la actividad.";
      setError(Array.isArray(msgBack) ? msgBack.join(", ") : String(msgBack));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-y-auto h-[calc(100vh-10rem)]">
      <Card className="p-8 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-8">
          <ListChecks className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Registrar Actividad</h2>
        </div>

        <ActividadForm
          onSubmit={handleSubmit}
          isLoading={loading}
          submitLabel="Registrar"
        />

        {/* Errores */}
        {error && (
          <p className="text-red-500 text-xs mt-4">{error}</p>
        )}
      </Card>
    </div>
  );
}
