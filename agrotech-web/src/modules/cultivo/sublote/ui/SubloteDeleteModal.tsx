import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subloteName?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export default function SubloteDeleteModal({
  open,
  onOpenChange,
  subloteName,
  onConfirm,
  loading,
}: Props) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Eliminar sublote</ModalHeader>
        <ModalBody>
          ¿Seguro que deseas eliminar el sublote <strong>{subloteName}</strong>?
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
