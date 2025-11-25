import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

export default function ToastDialog({
  open, title="Notificación", message, onClose, variant="danger",
}: {
  open: boolean; title?: string; message: string; onClose: () => void;
  variant?: "danger" | "success" | "warning" | "primary";
}) {
  return (
    <Modal isOpen={open} onClose={onClose} placement="top-center" backdrop="blur">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody><p>{message}</p></ModalBody>
        <ModalFooter>
          <Button color={variant} onPress={onClose}>Cerrar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
