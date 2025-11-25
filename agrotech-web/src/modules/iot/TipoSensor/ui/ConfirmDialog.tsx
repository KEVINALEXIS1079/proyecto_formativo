// src/modules/iot/TipoSensor/widgets/ConfirmDialog.tsx
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
} from "@heroui/react";

type Props = {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmColor?: "primary" | "danger" | "success" | "warning" | "secondary" | "default";
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  onClose,
  onConfirm,
  confirmColor = "danger",
}: Props) {
  return (
    <Modal
      isOpen={open}
      onOpenChange={(v) => !v && onClose()}
      placement="center"
      hideCloseButton={loading}
    >
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">{title}</ModalHeader>
        <ModalBody>
          {message ? (
            <p className="text-sm text-foreground-500">{message}</p>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button color={confirmColor} onPress={onConfirm} isLoading={loading}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
