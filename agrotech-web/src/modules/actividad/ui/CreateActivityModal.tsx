import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  // ModalFooter removed
} from "@heroui/react";
import ActividadForm from "./ActividadForm";
import type { CreateActividadPayload } from "../models/types";
import { useCreateActividad } from "../hooks/useActividades";
import toast from "react-hot-toast";

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateActivityModal({
  isOpen,
  onClose,
}: CreateActivityModalProps) {
  const createMutation = useCreateActividad();

  const handleSubmit = async (data: CreateActividadPayload) => {
    try {
      // Determine estado based on evidencias
      const hasEvidencias = data.evidencias && data.evidencias.length > 0;
      const activityData = {
        ...data,
        estado: hasEvidencias ? "Finalizada" : "Pendiente",
      };

      // Create Activity (backend already processes insumos, servicios, and evidencias)
      // Backend will validate the relationship between cultivo, lote, and sublote
      await createMutation.mutateAsync(activityData);

      toast.success(
        `Actividad creada exitosamente - Estado: ${activityData.estado}`
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Error al crear la actividad");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      isDismissable={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Registrar Actividad
            </ModalHeader>
            <ModalBody>
              <ActividadForm
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
                submitLabel="Registrar"
                onCancel={onClose}
              />
            </ModalBody>
            {/* Footer removed, handled by form */}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
