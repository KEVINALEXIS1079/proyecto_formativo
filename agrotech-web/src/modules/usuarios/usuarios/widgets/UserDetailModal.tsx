import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { RotateCcw, Trash2 } from "lucide-react";
import type { UsuarioLite } from "../model/types";
import UserInfoGrid from "./UserInfoGrid";

export default function UserDetailModal({
  user, isOpen, onClose, onEdit, onToggleEstado, onDelete, onRestore,
}: {
  user: UsuarioLite | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (u: UsuarioLite) => void;
  onToggleEstado: (u: UsuarioLite) => void;
  onDelete: (u: UsuarioLite) => void;
  onRestore: (u: UsuarioLite) => void;
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="xl">
      <ModalContent className="md:max-w-2xl">
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">Información del usuario</ModalHeader>
            <ModalBody>{user && <UserInfoGrid u={user} />}</ModalBody>
            <ModalFooter className="flex items-center justify-between">
              {user?.estado !== "eliminado" ? (
                <div className="flex flex-wrap gap-2">
                  <Button variant="flat" onPress={() => user && onEdit(user)}>Editar</Button>
                  <Button variant="flat" onPress={() => user && onToggleEstado(user)}>
                    {user?.estado === "activo" ? "Inactivar" : "Activar"}
                  </Button>
                  <Button color="danger" variant="flat" startContent={<Trash2 size={16} />} onPress={() => user && onDelete(user)}>
                    Eliminar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button color="success" variant="flat" startContent={<RotateCcw size={16} />} onPress={() => user && onRestore(user)}>
                    Restaurar
                  </Button>
                </div>
              )}
              <Button onPress={onClose}>Cerrar</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
