import { useNavigate } from "react-router-dom";
import { useCreateAlmacen } from "../hooks/useCreateAlmacen";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import AlmacenForm from "../widgets/AlmacenForm";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import type { CreateAlmacenInput } from "../model/types";

export default function CrearAlmacenPage() {
  const navigate = useNavigate();
  const createMutation = useCreateAlmacen();

  const handleSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: (result) => {
        toast.success("Almacén creado correctamente");
        navigate(`/inventario/almacenes/${result.id}`);
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Volver"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">Crear Almacén</h1>
      </div>
      <Modal isOpen={true} size="md" onOpenChange={() => navigate(-1)}>
        <ModalContent>
          <ModalHeader>Nuevo Almacén</ModalHeader>
          <ModalBody>
            <AlmacenForm
              onSubmit={async (data) => {
                createMutation.mutate(data as any, {
                  onSuccess: (result) => {
                    toast.success("Almacén creado correctamente");
                    navigate(`/inventario/almacenes/${result.id}`);
                  },
                });
              }}
              isLoading={createMutation.isPending}
              submitLabel="Crear"
              isEdit={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}