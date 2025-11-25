import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@heroui/react";
import type { RolLite, UsuarioLite } from "../model/types";
import { IdCard, Mail, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Estado para diálogo de confirmación de rol
type ConfirmState = {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

function ConfirmDialog({
  state,
  setState,
  isBusy = false,
}: {
  state: ConfirmState;
  setState: (s: ConfirmState) => void;
  isBusy?: boolean;
}) {
  const onClose = () => setState({ ...state, open: false });
  console.log("ConfirmDialog rendering with isOpen:", state.open);

  return (
    <Modal isOpen={state.open} onOpenChange={onClose} placement="center" hideCloseButton>
      <ModalContent>
        <ModalHeader className="text-base font-semibold">{state.title}</ModalHeader>
        {state.message ? <ModalBody className="text-default-600">{state.message}</ModalBody> : null}
        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
            isDisabled={isBusy}
          >
            {state.cancelText ?? "Cancelar"}
          </Button>
          <Button
            color="danger"
            onPress={() => {
              const cb = state.onConfirm;
              onClose();
              cb?.();
            }}
            isLoading={isBusy}
          >
            {state.confirmText ?? "Confirmar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function UserEditModal({
  user, roles, isOpen, onClose, onSubmit,
}: {
  user: UsuarioLite | null;
  roles: RolLite[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { id: number; dto: Partial<UsuarioLite> & { idRol?: number } }) => void;
}) {
  const [form, setForm] = useState<Partial<UsuarioLite>>({
    nombre: user?.nombre,
    apellido: user?.apellido,
    cedula: user?.cedula,
    telefono: user?.telefono,
    correo: user?.correo,
    idFicha: user?.idFicha,
    rol: user?.rol ?? roles[0],
  });

  // Estado para diálogo de confirmación de cambio de rol
  const [confirmRol, setConfirmRol] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
  });

  // sincroniza cuando cambie el user o la lista de roles
  useEffect(() => {
    if (!user) return;
    setForm({
      nombre: user.nombre,
      apellido: user.apellido,
      cedula: user.cedula,
      telefono: user.telefono,
      correo: user.correo,
      idFicha: user.idFicha,
      rol: user.rol ?? roles[0],
    });
  }, [user, roles]);

  const can = useMemo(() => {
    const base =
      (form.nombre?.trim()?.length || 0) > 1 &&
      (form.apellido?.trim()?.length || 0) > 1 &&
      (form.cedula?.trim()?.length || 0) >= 6 &&
      (form.telefono?.trim()?.length || 0) >= 10 &&
      (form.correo?.includes("@") || false) &&
      (form.idFicha?.trim()?.length || 0) >= 3;
    return !!base;
  }, [form]);

  const selectedRolKey = String(((form.rol as RolLite)?.id) ?? roles[0]?.id ?? "");

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) onClose(); }}
        placement="top-center"
        size="xl"
      >
        <ModalContent className="md:max-w-2xl">
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Editar usuario</ModalHeader>
              <ModalBody>
                {user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Número de documento"
                      startContent={<IdCard size={16} />}
                      value={form.cedula ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, cedula: e.target.value }))}
                    />
                    <Input
                      label="Nombre"
                      value={form.nombre ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
                    />
                    <Input
                      label="Apellido"
                      value={form.apellido ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, apellido: e.target.value }))}
                    />
                    <Input
                      label="Correo electrónico"
                      type="email"
                      startContent={<Mail size={16} />}
                      value={form.correo ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, correo: e.target.value }))}
                    />
                    <Input
                      label="Teléfono"
                      startContent={<Phone size={16} />}
                      value={form.telefono ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, telefono: e.target.value }))}
                    />
                    <Input
                      label="ID ficha"
                      value={form.idFicha ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, idFicha: e.target.value }))}
                    />

                    <Select
                      label="Rol"
                      selectedKeys={new Set([selectedRolKey])}
                      onSelectionChange={(keys) => {
                        console.log("onSelectionChange triggered", keys);
                        const k = Array.from(keys as Set<string | number>)[0];
                        const id = typeof k === "string" ? Number(k) : Number(k);
                        console.log("id:", id, "type:", typeof id);
                        const nuevoRol = roles.find((r) => r.id === id) ?? roles[0];
                        console.log("nuevoRol:", nuevoRol, "nuevoRol.id:", nuevoRol.id);
                        console.log("form.rol:", form.rol, "form.rol.id:", (form.rol as RolLite)?.id, "comparison:", nuevoRol.id !== (form.rol as RolLite)?.id);
                        if (nuevoRol.id !== (form.rol as RolLite)?.id) {
                          console.log("Setting confirmRol to open: true");
                          setConfirmRol({
                            open: true,
                            title: "Cambiar rol",
                            message: "Cambiar el rol asignará o quitará permisos al usuario. ¿Deseas continuar?",
                            confirmText: "Continuar",
                            cancelText: "Cancelar",
                            onConfirm: () => setForm((s) => ({ ...s, rol: nuevoRol })),
                          });
                        }
                      }}
                      disallowEmptySelection
                    >
                      {roles.map((r) => (
                        <SelectItem key={String(r.id)} textValue={r.nombre}>
                          {r.nombre}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancelar</Button>
                <Button
                  color="primary"
                  isDisabled={!can || !user}
                  onPress={() => {
                    if (!user) return;
                    const dto = {
                      ...form,
                      idRol: (form.rol as RolLite | undefined)?.id,
                    };
                    console.log("UserEditModal onSubmit dto:", dto);
                    onSubmit({
                      id: user.id,
                      dto,
                    });
                  }}
                >
                  Guardar cambios
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Diálogo de confirmación para cambio de rol */}
      <ConfirmDialog state={confirmRol} setState={setConfirmRol} />
    </>
  );
}
