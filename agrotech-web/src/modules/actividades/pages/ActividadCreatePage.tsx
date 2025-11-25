import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";
import ActividadForm from "../widgets/ActividadForm";

export default function ActividadCreatePage() {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-bold">Crear Actividad</h1>
      </div>

      <ActividadForm />
    </div>
  );
}