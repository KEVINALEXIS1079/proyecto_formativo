import { useNavigate } from "react-router-dom";
import { useCreateInsumo } from "../hooks/useCreateInsumo";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { InsumoForm } from "../widgets/InsumoForm";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import type { CreateInsumoInput } from "../model/types";

export default function CrearInsumoPage() {
  const navigate = useNavigate();
  const createMutation = useCreateInsumo();

  const handleSubmit = async (data: CreateInsumoInput | any): Promise<{ id?: number }> => {
    return new Promise((resolve, reject) => {
      createMutation.mutate(data, {
        onSuccess: (result) => {
          toast.success("Insumo creado correctamente");
          const insumoId = result.id;
          navigate(`/inventario/${insumoId}`);
          resolve({ id: insumoId });
        },
        onError: reject,
      });
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
        <h1 className="text-3xl font-bold">Crear Insumo</h1>
      </div>
      <Modal isOpen={true} size="5xl" onOpenChange={() => navigate(-1)} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="px-6 py-4 border-b border-gray-100">Nuevo Insumo</ModalHeader>
          <ModalBody className="flex-1 overflow-y-auto p-6">
            <InsumoForm
              insumo={undefined}
              onClose={() => navigate(-1)}
              onSuccess={handleSubmit}
              isEdit={false}
              hideFooter={true}
            />
          </ModalBody>
          <ModalFooter className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <Button type="button" variant="light" color="danger" onPress={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="insumo-form"
              color="success"
              isLoading={createMutation.isPending}
              className="text-black font-semibold shadow-md"
            >
              Crear Insumo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}