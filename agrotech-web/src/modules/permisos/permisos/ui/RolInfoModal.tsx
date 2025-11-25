import { useEffect, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Shield, Pencil, Trash, Check } from "lucide-react";
import SectionTitle from "./SectionTitle";

export default function RolInfoModal({
  open, onClose, rol, usersCount, onEdit, onDelete,
}: { open: boolean; onClose: () => void; rol: string | null; usersCount: number; onEdit: (nuevoNombre: string) => void; onDelete: () => void; }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(rol ?? "");
  useEffect(() => { setValue(rol ?? ""); setEditing(false); }, [rol, open]);

  return (
    <Modal isOpen={open} onClose={onClose} size="md" placement="center" backdrop="blur">
      <ModalContent>
        {() => <>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-success" /><span>Información del rol</span></div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <div>
                <SectionTitle>Rol</SectionTitle>
                {!editing ? (
                  <div className="rounded-xl px-3 py-2 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">{rol}</div>
                ) : (
                  <Input value={value} onChange={(e) => setValue(e.target.value)} size="sm" variant="bordered" autoFocus placeholder="Nombre del rol" />
                )}
              </div>
              <div>
                <SectionTitle>Usuarios con este rol</SectionTitle>
                <div className="rounded-xl px-3 py-2 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">{usersCount}</div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="justify-between">
            {!editing ? (
              <>
                <Button variant="flat" startContent={<Pencil className="h-4 w-4" />} onPress={() => setEditing(true)}>Editar</Button>
                <div className="flex gap-2">
                  <Button variant="light" onPress={onClose}>Cerrar</Button>
                  <Button color="danger" startContent={<Trash className="h-4 w-4" />} onPress={onDelete}>Eliminar</Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="flat" onPress={() => setEditing(false)}>Cancelar</Button>
                <div className="flex gap-2">
                  <Button variant="light" onPress={onClose}>Cerrar</Button>
                  <Button color="success" startContent={<Check className="h-4 w-4" />}
                          onPress={() => { const nuevo = value.trim(); if (!nuevo) return; onEdit(nuevo); setEditing(false); }}>
                    Guardar
                  </Button>
                </div>
              </>
            )}
          </ModalFooter>
        </>}
      </ModalContent>
    </Modal>
  );
}
