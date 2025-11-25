import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardBody, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import EpaDetail from "../widgets/EpaDetail";
import { useEpaById, useRemoveEpa } from "../hooks/useFitosanitario";

export default function EpaDetailFeature() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const epaId = Number(id);

  const { data: epa, isLoading, error } = useEpaById(epaId);
  const removeMutation = useRemoveEpa();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = () => {
    navigate(`/fitosanitario/${epaId}/editar`);
  };

  const handleDelete = async () => {
    if (!epa) return;

    try {
      await removeMutation.mutateAsync(epa.id);
      toast.success("EPA eliminado exitosamente");
      navigate("/fitosanitario", { replace: true });
    } catch (error) {
      console.error("Error eliminando EPA:", error);
      toast.error("Error al eliminar el EPA");
    }
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
          <h1 className="text-2xl font-bold">Detalle del EPA</h1>
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
          <h1 className="text-2xl font-bold">Detalle del EPA</h1>
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
          <h1 className="text-2xl font-bold">Detalle del EPA</h1>
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
      {/* Header con botones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="flat"
            isIconOnly
            onPress={() => navigate("/fitosanitario")}
            startContent={<ArrowLeft size={16} />}
          />
          <h1 className="text-2xl font-bold">Detalle del EPA</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="flat"
            color="primary"
            startContent={<Edit size={16} />}
            onPress={handleEdit}
          >
            Editar
          </Button>
          <Button
            variant="flat"
            color="danger"
            startContent={<Trash2 size={16} />}
            onPress={() => setShowDeleteConfirm(true)}
          >
            Eliminar
          </Button>
        </div>
      </div>

      {/* Contenido del EPA */}
      <EpaDetail epa={epa} />

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>Confirmar eliminación</ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar el EPA <strong>"{epa.nombre}"</strong>?
            </p>
            <p className="text-sm text-default-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setShowDeleteConfirm(false)}
              isDisabled={removeMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={removeMutation.isPending}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}