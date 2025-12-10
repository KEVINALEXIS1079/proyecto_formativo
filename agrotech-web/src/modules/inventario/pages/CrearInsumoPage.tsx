import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateInsumo } from "../hooks/useCreateInsumo";
import { useUploadInsumoImage } from "../hooks/useUploadInsumoImage";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { InsumoForm } from "../widgets/InsumoForm";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import type { CreateInsumoInput } from "../model/types";

export default function CrearInsumoPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createMutation = useCreateInsumo();
  const uploadMutation = useUploadInsumoImage();

  const handleSubmit = async (data: CreateInsumoInput | any): Promise<{id?: number}> => {
    return new Promise((resolve, reject) => {
      createMutation.mutate(data, {
        onSuccess: (result) => {
          toast.success("Insumo creado correctamente");
          const insumoId = result.id;
          if (selectedFile) {
            uploadMutation.mutate(
              { id: insumoId, file: selectedFile },
              {
                onSuccess: () => {
                  navigate(`/inventario/${insumoId}`);
                  resolve({ id: insumoId });
                },
                onError: reject,
              }
            );
          } else {
            navigate(`/inventario/${insumoId}`);
            resolve({ id: insumoId });
          }
        },
        onError: reject,
      });
    });
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const initialValues = {
    fechaIngreso: new Date().toISOString().split('T')[0],
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
      <Modal isOpen={true} size="4xl" onOpenChange={() => navigate(-1)}>
        <ModalContent>
          <ModalHeader>Nuevo Insumo</ModalHeader>
          <ModalBody>
            <InsumoForm
              insumo={undefined}
              onClose={() => navigate(-1)}
              onSuccess={handleSubmit}
              isEdit={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}