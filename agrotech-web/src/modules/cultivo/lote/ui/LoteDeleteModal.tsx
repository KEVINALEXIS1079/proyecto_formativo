// ui/LoteDeleteModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loteName?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export default function LoteDeleteModal({
  open,
  onOpenChange,
  loteName,
  onConfirm,
  loading,
}: Props) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        <ModalHeader>Eliminar lote</ModalHeader>
        <ModalBody>
          ¿Seguro que deseas eliminar el lote <strong>{loteName}</strong>?
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={loading}>
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
