import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import EpaForm from "../widgets/EpaForm";
import { useCreateEpa } from "../hooks/useFitosanitario";
import type { CreateEpaInput } from "../models/types";

export default function EpaCreateFeature() {
  const navigate = useNavigate();
  const createMutation = useCreateEpa();
  const isFormOpen = true;

  const handleSubmit = async (input: CreateEpaInput) => {
    try {
      const result = await createMutation.mutateAsync(input);
      toast.success("EPA creado exitosamente");
      // Redirigir al detalle del EPA creado
      navigate(`/fitosanitario/${result.id}`, { replace: true });
    } catch (error) {
      console.error("Error creando EPA:", error);
      toast.error("Error al crear el EPA");
    }
  };

  const handleClose = () => {
    navigate("/fitosanitario", { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Header con botón volver */}
      <div className="flex items-center gap-4">
        <Button
          variant="flat"
          isIconOnly
          onPress={() => navigate("/fitosanitario")}
          startContent={<ArrowLeft size={16} />}
        />
        <h1 className="text-2xl font-bold">Crear nuevo EPA</h1>
      </div>

      {/* Formulario */}
      <EpaForm
        epa={null}
        isOpen={isFormOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}