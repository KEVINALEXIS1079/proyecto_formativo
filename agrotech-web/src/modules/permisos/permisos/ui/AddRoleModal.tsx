import { useEffect, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Plus } from "lucide-react";

export default function AddRoleModal({
  open, onClose, onCreate, existing,
}: { open: boolean; onClose: () => void; onCreate: (name: string) => void; existing: string[]; }) {
  const [name, setName] = useState(""); useEffect(() => { if (open) setName(""); }, [open]);
  const handleCreate = () => {
    const n = name.trim(); if (!n) return;
    if (existing.some((r) => r.toLowerCase() === n.toLowerCase())) { alert("Ese rol ya existe."); return; }
    onCreate(n);
  };
  return (
    <Modal isOpen={open} onClose={onClose} size="sm" placement="center" backdrop="blur">
      <ModalContent>
        {() => <>
          <ModalHeader>Agregar rol</ModalHeader>
          <ModalBody>
            <Input label="Nombre del rol" placeholder="Ej. Coordinador" value={name} onChange={(e) => setName(e.target.value)} variant="bordered" autoFocus />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancelar</Button>
            <Button color="success" onPress={handleCreate} startContent={<Plus className="h-4 w-4" />}>Crear</Button>
          </ModalFooter>
        </>}
      </ModalContent>
    </Modal>
  );
}
