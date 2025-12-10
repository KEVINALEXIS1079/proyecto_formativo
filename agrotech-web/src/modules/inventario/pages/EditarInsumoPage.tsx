import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInsumoById } from "../hooks/useInsumoById";
import { useUpdateInsumo } from "../hooks/useUpdateInsumo";
import { useUploadInsumoImage } from "../hooks/useUploadInsumoImage";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { InsumoForm } from "../widgets/InsumoForm";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import type { UpdateInsumoInput } from "../model/types";

export default function EditarInsumoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const insumoId = parseInt(id!);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: insumo, isLoading: isLoadingInsumo } = useInsumoById(insumoId);
  const updateMutation = useUpdateInsumo();
  const uploadMutation = useUploadInsumoImage();

  const handleSubmit = (data: UpdateInsumoInput) => {
    console.log('DEBUG: Editando insumo con data:', data);
    updateMutation.mutate(
      { id: insumoId, payload: data },
      {
        onSuccess: () => {
          toast.success("Insumo actualizado correctamente");
          if (selectedFile) {
            uploadMutation.mutate(
              { id: insumoId, file: selectedFile },
              {
                onSuccess: () => {
                  navigate(`/inventario/${insumoId}`);
                },
              }
            );
          } else {
            navigate(`/inventario/${insumoId}`);
          }
        },
        onError: (error) => {
          console.error('Error al actualizar insumo:', error);
          toast.error("Error al actualizar el insumo");
        },
      }
    );
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  if (isLoadingInsumo) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <p>Cargando insumo...</p>
      </div>
    );
  }

  if (!insumo) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <p>Insumo no encontrado</p>
      </div>
    );
  }

  const initialValues = {
    nombre: insumo.nombre,
    descripcion: insumo.descripcion,
    imagenUrl: insumo.imagenUrl,
    presentacionTipo: insumo.presentacionTipo,
    presentacionCantidad: insumo.presentacionCantidad,
    presentacionUnidad: insumo.presentacionUnidad,
    unidadBase: insumo.unidadBase,
    stockPresentaciones: insumo.stockPresentaciones,
    precioUnitario: insumo.precioUnitarioPresentacion,
    fechaIngreso: insumo.fechaIngreso,
    idCategoria: insumo.categoria.id,
    idProveedor: insumo.proveedor.id,
    idAlmacen: insumo.almacen.id,
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
        <h1 className="text-3xl font-bold">Editar Insumo</h1>
      </div>
      <Modal isOpen={true} size="4xl" onOpenChange={() => navigate(-1)}>
        <ModalContent>
          <ModalHeader>Editar Insumo</ModalHeader>
          <ModalBody>
            <InsumoForm
              insumo={insumo}
              onClose={() => navigate(-1)}
              onSuccess={async (data) => {
                await handleSubmit(data);
                return {};
              }}
              isEdit={true}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}