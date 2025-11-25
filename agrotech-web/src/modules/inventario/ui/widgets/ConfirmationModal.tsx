import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@heroui/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (descripcion: string) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
}: ConfirmationModalProps) {
  const [descripcion, setDescripcion] = useState("");

  const handleConfirm = () => {
    onConfirm(descripcion);
    setDescripcion("");
  };

  const handleClose = () => {
    setDescripcion("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p>{message}</p>
          <Textarea
            label="Descripción de la operación"
            placeholder="Ingrese una descripción opcional para esta acción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            minRows={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button color="primary" onPress={handleConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}