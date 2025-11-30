import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardBody } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import EpaForm from "../widgets/EpaForm";
import { useEpaById, useUpdateEpa } from "../hooks/useFitosanitario";
import type { UpdateEpaInput } from "../models/types";

export default function EpaEditFeature() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const epaId = Number(id);

  const { data: epa, isLoading, error } = useEpaById(epaId);
  const updateMutation = useUpdateEpa();
  const isFormOpen = true;

  const handleSubmit = async (input: UpdateEpaInput) => {
    if (!epa) return;

    try {
      await updateMutation.mutateAsync({
        id: epa.id,
        input,
      });
      toast.success("EPA actualizado exitosamente");
      // Redirigir al detalle
      navigate(`/fitosanitario/${epa.id}`, { replace: true });
    } catch (error) {
      console.error("Error actualizando EPA:", error);
      toast.error("Error al actualizar el EPA");
    }
  };

  const handleClose = () => {
    navigate(`/fitosanitario/${epaId}`, { replace: true });
  };

  if (isNaN(epaId)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="flat"
            isIconOnly
            onPress={() => navigate("/fitosanitario")}
            startContent={<ArrowLeft size={16} />}
          />
          <h1 className="text-2xl font-bold">Editar EPA</h1>
        </div>
        <Card>
          <CardBody>
            <p className="text-danger">ID de EPA inválido</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="flat"
            isIconOnly
            onPress={() => navigate("/fitosanitario")}
            startContent={<ArrowLeft size={16} />}
          />
          <h1 className="text-2xl font-bold">Editar EPA</h1>
        </div>
        <Card>
          <CardBody className="py-12 text-center">
            <p>Cargando EPA...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !epa) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="flat"
            isIconOnly
            onPress={() => navigate("/fitosanitario")}
            startContent={<ArrowLeft size={16} />}
          />
          <h1 className="text-2xl font-bold">Editar EPA</h1>
        </div>
        <Card>
          <CardBody>
            <p className="text-danger">
              {error ? "Error al cargar el EPA" : "EPA no encontrado"}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón volver */}
      <div className="flex items-center gap-4">
        <Button
          variant="flat"
          isIconOnly
          onPress={() => navigate(`/fitosanitario/${epaId}`)}
          startContent={<ArrowLeft size={16} />}
        />
        <h1 className="text-2xl font-bold">Editar EPA: {epa.nombre}</h1>
      </div>

      {/* Formulario */}
      <EpaForm
        epa={epa}
        isOpen={isFormOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}