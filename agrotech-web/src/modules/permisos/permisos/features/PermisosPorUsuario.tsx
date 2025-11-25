import { useMemo, useState } from "react";
import {
  Button,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableColumn,
  TableRow,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Layers } from "lucide-react";

import Surface from "../ui/Surface";
import SectionTitle from "../ui/SectionTitle";
import PermisoChip from "../ui/PermisoChip";

import { usePermisosUserSelection, useTogglePermisoOnUser, useAssignPermisosToUser } from "../hooks/usePermisos";
import UsuariosTable from "../ui/UsuariosTable";
import { useUsuariosLite } from "../hooks/useUsuariosLite";

import {
  buildModuleMapFromPermisos,
  moduleOptionsFromMap,
  getModuleLabelFromMap,
  buildPermisoLabel,
} from "../model/modules-map";

function ConfirmDialog({
  open,
  title,
  message,
  onClose,
  onConfirm,
  isBusy = false,
}: {
  open: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
  isBusy?: boolean;
}) {
  console.log("ConfirmDialog render:", { open, title, message });

  return (
    <Modal isOpen={open} onOpenChange={onClose} placement="center" hideCloseButton>
      <ModalContent>
        <ModalHeader className="text-base font-semibold">{title}</ModalHeader>
        {message ? <ModalBody className="text-default-600">{message}</ModalBody> : null}
        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
            isDisabled={isBusy}
          >
            Cancelar
          </Button>
          <Button
            color="danger"
            onPress={() => {
              console.log("ConfirmDialog onConfirm called");
              onClose();
              onConfirm();
            }}
            isLoading={isBusy}
          >
            Confirmar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

type ModOpt = { id: string; nombre: string };

export default function PermisosPorUsuario() {
  const [selectedUser, setSelectedUser] = useState<{ id: number; nombre: string; rol?: any } | null>(null);
  const [moduleId, setModuleId] = useState<number | undefined>(undefined);

  // Estado para diálogo de confirmación
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message?: string;
    onConfirm?: () => void;
  }>({ open: false, title: "", message: "" });

  // usuarios
  const { data: users = [] } = useUsuariosLite({ estado: "activo", limit: 500 });

  // permisos filtrados por módulo (para pintar la tabla)
  const { data: sel } = usePermisosUserSelection(selectedUser?.id, moduleId);

  // permisos SIN filtrar (solo para poblar el Select de módulos)
  const { data: selAll } = usePermisosUserSelection(selectedUser?.id, undefined);

  const toggle = useTogglePermisoOnUser();
  const assignBulk = useAssignPermisosToUser();
  const permisos = sel?.permisos ?? [];
  const allOn = useMemo(() => permisos.length > 0 && permisos.every((p) => p.selected), [permisos]);

  // nombres “bonitos” de módulos construidos desde la API (selAll)
  const moduleMap = useMemo(
    () => buildModuleMapFromPermisos(selAll?.permisos ?? []),
    [selAll?.permisos]
  );

  // Opciones del Select (solo módulos específicos)
  const MODULE_SELECT_OPTIONS: ModOpt[] = useMemo(() => {
    return moduleOptionsFromMap(moduleMap).map((o) => ({ id: String(o.id), nombre: o.nombre }));
  }, [moduleMap]);

  const selectedKeys = useMemo(
    () => new Set<string>(moduleId ? [String(moduleId)] : []),
    [moduleId]
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {/* Izquierda: tabla de usuarios */}
      <div className="md:col-span-5">
        <Surface className="sticky top-4 h-[calc(100dvh-200px)] overflow-hidden">
          <UsuariosTable
            users={users as any}
            selectedId={selectedUser?.id ?? null}
            onPick={setSelectedUser as any}
          />
        </Surface>
      </div>

      {/* Derecha: detalle + permisos */}
      <Surface className="md:col-span-7">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 space-y-4">
            {/* header usuario + módulo */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-8">
                <SectionTitle>Usuario</SectionTitle>
                <div className="rounded-xl px-3 py-2 text-sm bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
                  {selectedUser ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{selectedUser.nombre}</div>
                        <div className="text-xs opacity-60">
                          {typeof (selectedUser as any).rol === "string"
                            ? (selectedUser as any).rol
                            : (selectedUser as any).rol?.nombre}
                        </div>
                      </div>
                      <span className="text-xs opacity-60">ID {selectedUser.id}</span>
                    </div>
                  ) : (
                    <span className="opacity-60">Seleccione un usuario</span>
                  )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-4">
                <SectionTitle>Módulo</SectionTitle>
                <Select<ModOpt>
                  aria-label="Seleccionar módulo"
                  items={MODULE_SELECT_OPTIONS}
                  selectionMode="single"
                  selectedKeys={selectedKeys}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys as Set<string>)[0];
                    setModuleId(k ? Number(k) : undefined);
                  }}
                  size="md"
                  radius="lg"
                  variant="bordered"
                  placeholder="Seleccione un módulo"
                  className="w-full"
                  popoverProps={{
                    placement: "bottom",
                    offset: 8,
                    classNames: { content: "max-h-80 overflow-auto" },
                  }}
                  classNames={{
                    trigger:
                      "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                    value: "text-sm",
                    popoverContent: "rounded-xl min-w-[18rem] max-h-80 overflow-auto",
                    listbox: "max-h-80 overflow-auto",
                  }}
                >
                  {(item) => (
                    <SelectItem key={item.id} className="text-sm py-2">
                      {item.nombre}
                    </SelectItem>
                  )}
                </Select>
              </div>
            </div>

            {/* permisos */}
            <div className="rounded-2xl p-3 bg-gradient-to-br from-white/70 to-white/40 dark:from-white/5 dark:to-white/0 ring-1 ring-black/5 dark:ring-white/10">
              <div className="mb-2 flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="h-4 w-4" /> Permisos del módulo
                </div>
                <Button
                  size="md"
                  variant="solid"
                  color="success"
                  isDisabled={!selectedUser || !moduleId || permisos.length === 0}
                  isLoading={assignBulk.isPending || toggle.isPending}
                  onPress={() => {
                    console.log("Botón asignar/desactivar todos presionado");
                    if (!selectedUser || !moduleId || permisos.length === 0) return;
                    if (allOn) {
                      // Desactivar todos: quitar permisos uno por uno
                      permisos.forEach((p: any) => {
                        if (p.selected) {
                          toggle.mutate({
                            userId: selectedUser.id,
                            permisoId: p.id,
                            enable: false,
                            moduleId,
                          });
                        }
                      });
                    } else {
                      // Asignar todos: usar API en bloque para asignar los faltantes
                      const permisosToAssign = permisos.filter((p: any) => !p.selected).map((p: any) => p.id);
                      if (permisosToAssign.length > 0) {
                        assignBulk.mutate({
                          userId: selectedUser.id,
                          permisoIds: permisosToAssign,
                          moduleId,
                        });
                      }
                    }
                  }}
                >
                  {allOn ? "Desactivar todos" : "Asignar todos"}
                </Button>
              </div>

              {selectedUser && moduleId ? (
                permisos.length ? (
                  <Table aria-label="permisos modulo" removeWrapper className="[&_[data-slot=td]]:py-2">
                    <TableHeader>
                      <TableColumn>Permiso</TableColumn>
                      <TableColumn className="w-32 text-right">Estado</TableColumn>
                    </TableHeader>
                    <TableBody items={permisos}>
                      {(p) => {
                        const isRedundant = p.selected && p.fuente === 'rol';
                        return (
                          <TableRow key={p.id} className="hover:bg-success/10 transition-colors">
                            <TableCell>
                              <PermisoChip
                                checked={!!p.selected}
                                label={buildPermisoLabel(p)}
                                fuente={p.fuente}
                                isRedundant={isRedundant}
                                onToggle={() => {
                                console.log("PermisoChip onToggle llamado para permiso:", p.id);
                                if (!selectedUser) return;
                                console.log("Abriendo modal para toggle permiso individual");
                                setConfirm({
                                  open: true,
                                  title: !p.selected ? "Asignar permiso" : "Quitar permiso",
                                  message: `¿Estás seguro de ${!p.selected ? "asignar" : "quitar"} este permiso al usuario?`,
                                  onConfirm: () => {
                                    console.log("Confirmando toggle permiso individual");
                                    toggle.mutate({
                                      userId: selectedUser.id,
                                      permisoId: p.id,
                                      enable: !p.selected,
                                      moduleId, // ⬅️ IMPORTANTE
                                    });
                                  },
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <Switch
                                color="success"
                                isSelected={!!p.selected}
                                onValueChange={(v) => {
                                  console.log("Switch onValueChange llamado para permiso:", p.id, "valor:", v);
                                  if (!selectedUser) return;
                                  console.log("Abriendo modal para switch toggle");
                                  setConfirm({
                                    open: true,
                                    title: v ? "Asignar permiso" : "Quitar permiso",
                                    message: `¿Estás seguro de ${v ? "asignar" : "quitar"} este permiso al usuario?`,
                                    onConfirm: () => {
                                      console.log("Confirmando switch toggle");
                                      toggle.mutate({
                                        userId: selectedUser.id,
                                        permisoId: p.id,
                                        enable: v,
                                        moduleId, // ⬅️ IMPORTANTE
                                      });
                                    },
                                  });
                                }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-sm opacity-60">No hay permisos para este módulo.</div>
                )
              ) : (
                <div className="text-sm opacity-60">
                  {selectedUser ? "Seleccione un módulo para ver los permisos." : "Seleccione un usuario."}
                </div>
              )}
            </div>
          </div>
        </div>
      </Surface>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onClose={() => setConfirm((s) => ({ ...s, open: false }))}
        onConfirm={() => {
          confirm.onConfirm?.();
          setConfirm((s) => ({ ...s, open: false }));
        }}
      />
    </div>
  );
}
