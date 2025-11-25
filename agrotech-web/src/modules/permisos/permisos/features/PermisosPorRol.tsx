import { useMemo, useState, useCallback } from "react";
import {
  Button,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableColumn,
  TableRow,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Layers } from "lucide-react";

import Surface from "../ui/Surface";
import RolesTable from "../ui/RolesTable";
import RolInfoModal from "../ui/RolInfoModal";
import AddRoleModal from "../ui/AddRoleModal";
import SectionTitle from "../ui/SectionTitle";

import {
  useRolesActivos,
  useRolesEliminados,
  usePermisosRoleSelection,
  useTogglePermisoOnRole,
  useRolesCrud,
} from "../hooks/usePermisos";
import type { RolLite } from "../model/types";

// helpers de labels “bonitos”
import {
  buildModuleMapFromPermisos,
  moduleOptionsFromMap,
  buildPermisoLabel,
  getModuleLabelFromMap,
} from "../model/modules-map";

type ModOpt = { id: string; nombre: string };

/* =========================
 * Confirm Dialog (reutilizable)
 * ========================= */
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

  return (
    <Modal isOpen={state.open} onOpenChange={onClose} placement="center" hideCloseButton>
      <ModalContent>
        <ModalHeader className="text-base font-semibold">{state.title}</ModalHeader>
        {state.message ? <ModalBody className="text-default-600 whitespace-pre-line">{state.message}</ModalBody> : null}
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isBusy}>
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

export default function PermisosPorRol() {
  const [rolId, setRolId] = useState<number | null>(null);
  const [moduleId, setModuleId] = useState<number | undefined>(undefined);
  const [showInfo, setShowInfo] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const { roles, counts } = useRolesActivos();
  const eliminados = useRolesEliminados();

  const sel = usePermisosRoleSelection(rolId ?? undefined, moduleId);
  const selAll = usePermisosRoleSelection(rolId ?? undefined, undefined);

  const toggle = useTogglePermisoOnRole();
  const crud = useRolesCrud();

  const rolesActivos = roles.data ?? [];
  console.log("DEBUG: rolesActivos:", rolesActivos);
  console.log("DEBUG: counts.data:", counts.data);
  const roleUsersMap = new Map((counts.data ?? []).map((c) => [c.id, c.usuarios]));
  const currentRole = rolesActivos.find((r) => r.id === rolId) ?? null;

  const permisos = sel.data?.permisos ?? [];
  const allOn = useMemo(() => permisos.length > 0 && permisos.every((p) => p.selected), [permisos]);

  // Mapa de nombres de módulo “bonitos”
  const moduleMap = useMemo(
    () => buildModuleMapFromPermisos(selAll.data?.permisos ?? []),
    [selAll.data?.permisos]
  );

  // Label del módulo seleccionado (visual)
  const currentModuleLabel = useMemo(
    () => getModuleLabelFromMap(moduleId ?? null, moduleMap),
    [moduleId, moduleMap]
  );

  // Opciones del Select
  const MODULE_SELECT_OPTIONS: ModOpt[] = useMemo(() => {
    const opts = moduleOptionsFromMap(moduleMap).map((o) => ({
      id: String(o.id),
      nombre: o.nombre,
    }));
    return [{ id: "__ALL__", nombre: "Todos" }, ...opts];
  }, [moduleMap]);

  const selectedKeys = useMemo(
    () => new Set<string>([moduleId ? String(moduleId) : "__ALL__"]),
    [moduleId]
  );

  // Contadores para tabs
  const activosCount = rolesActivos.length;
  const eliminadosCount = (eliminados.data ?? []).length;

  // =========================
  // Confirm state / helpers
  // =========================
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
  });

  const ask = useCallback(
    (cfg: Omit<ConfirmState, "open">) => {
      setConfirm({
        open: true,
        title: cfg.title,
        message: cfg.message,
        confirmText: cfg.confirmText,
        cancelText: cfg.cancelText ?? "Cancelar",
        onConfirm: cfg.onConfirm,
      });
    },
    []
  );

  // Cargando de mutaciones que usan el modal
  const anyBusy =
    crud.rename.isPending ||
    crud.remove.isPending ||
    crud.restore.isPending ||
    crud.create.isPending ||
    toggle.isPending;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {/* Columna izquierda: Roles (más grande y sticky) */}
      <div className="md:col-span-6">
        <div className="md:sticky md:top-2 md:space-y-3">
          <Tabs aria-label="roles" variant="underlined" color="success" className="w-full">
            <Tab
              key="activos"
              title={
                <div className="flex items-center gap-2">
                  <span>Activos</span>
                  <span className="rounded-md px-1.5 py-0.5 text-xs bg-success/10 text-success">
                    {activosCount}
                  </span>
                </div>
              }
            >
              <Surface className="p-3">
                <div className="max-h-[76vh] overflow-auto">
                  {(() => {
                    const rolesNames = rolesActivos.map((r) => r.nombre);
                    console.log("DEBUG: rolesNames para RolesTable:", rolesNames);
                    return (
                      <RolesTable
                        roles={rolesNames}
                        selected={currentRole?.nombre ?? null}
                        onPick={(name) => {
                          const r = rolesActivos.find((x) => x.nombre === name);
                          setRolId(r?.id ?? null);
                        }}
                        onView={() => setShowInfo(true)}
                        onAddClick={() => setShowAdd(true)}
                      />
                    );
                  })()}
                </div>
              </Surface>
            </Tab>

            <Tab
              key="eliminados"
              title={
                <div className="flex items-center gap-2">
                  <span>Eliminados</span>
                  <span className="rounded-md px-1.5 py-0.5 text-xs bg-default-200/60">
                    {eliminadosCount}
                  </span>
                </div>
              }
            >
              <Surface>
                <Table aria-label="roles eliminados" removeWrapper className="[&_[data-slot=td]]:py-2">
                  <TableHeader>
                    <TableColumn>Rol</TableColumn>
                    <TableColumn className="w-28 text-right">Acción</TableColumn>
                  </TableHeader>
                  <TableBody items={eliminados.data ?? []} emptyContent="Sin roles eliminados">
                    {(r: RolLite) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.nombre}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() =>
                                ask({
                                  title: "¿Restaurar rol?",
                                  message: `Se restaurará el rol "${r.nombre}".`,
                                  confirmText: "Restaurar",
                                  onConfirm: () => crud.restore.mutate(r.id),
                                })
                              }
                            >
                              restaurar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Surface>
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* Columna derecha: Permisos del rol */}
      <Surface className="md:col-span-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 space-y-4">
            {/* Header compacto con nombre de rol y Select */}
            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-12 md:col-span-7">
                <SectionTitle>Rol</SectionTitle>
                <div className="rounded-xl px-3 py-2 text-sm bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
                  {currentRole?.nombre ?? <span className="opacity-60">Seleccione un rol</span>}
                </div>
                {currentRole && (
                  <div className="mt-1 text-xs opacity-70">
                    Usuarios con este rol: {roleUsersMap.get(currentRole.id) ?? 0}
                  </div>
                )}
              </div>

              {/* ===== Select de MÓDULO ===== */}
              <div className="col-span-12 md:col-span-5">
                <SectionTitle>Módulo</SectionTitle>
                <Select<ModOpt>
                  aria-label="Seleccionar módulo"
                  items={MODULE_SELECT_OPTIONS}
                  selectionMode="single"
                  selectedKeys={selectedKeys}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys as Set<string>)[0];
                    setModuleId(k && k !== "__ALL__" ? Number(k) : undefined);
                  }}
                  popoverProps={{
                    placement: "bottom",
                    offset: 8,
                    classNames: { content: "max-h-80 overflow-auto" },
                  }}
                  size="md"
                  radius="lg"
                  variant="bordered"
                  placeholder="Todos"
                  className="w-full"
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

            {/* Contenedor de permisos con toolbar sticky y tabla scrollable */}
            <div className="rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-gradient-to-br from-white/70 to-white/40 dark:from-white/5 dark:to-white/0">
              {/* Toolbar sticky */}
              <div className="sticky top-2 z-10 mb-0.5 rounded-t-2xl px-3 py-2 bg-white/70 dark:bg-black/30 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm border-b border-black/5 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Layers className="h-4 w-4" /> Permisos del módulo — {currentModuleLabel}
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    color="success"
                    isDisabled={!currentRole || permisos.length === 0}
                    onPress={() => {
                      if (!currentRole || permisos.length === 0) return;
                      const accion = allOn ? "desactivar" : "asignar";
                      ask({
                        title: `¿${allOn ? "Desactivar" : "Asignar"} todos?`,
                        message: `Se van a ${accion} ${permisos.length} permisos en el rol "${currentRole.nombre}" para el ámbito: ${currentModuleLabel}.`,
                        confirmText: allOn ? "Desactivar todos" : "Asignar todos",
                        onConfirm: () => {
                          permisos.forEach((p) => {
                            if (p.selected !== !allOn) {
                              toggle.mutate({
                                roleId: currentRole.id,
                                permisoId: p.id,
                                enable: !allOn,
                                moduleId,
                              });
                            }
                          });
                        },
                      });
                    }}
                  >
                    {allOn ? "Desactivar todos" : "Asignar todos"}
                  </Button>
                </div>
              </div>

              {/* Tabla */}
              <div className="px-3 pb-3">
                {permisos.length ? (
                  <div className="max-h-[68vh] overflow-auto rounded-xl">
                    <Table aria-label="permisos rol" removeWrapper className="[&_[data-slot=td]]:py-2">
                      <TableHeader>
                        <TableColumn>Permiso</TableColumn>
                        <TableColumn className="w-32 text-right">Estado</TableColumn>
                      </TableHeader>
                      <TableBody items={permisos}>
                        {(p) => (
                          <TableRow key={p.id} className="hover:bg-success/10 transition-colors">
                            <TableCell>
                              <span className="text-sm">{buildPermisoLabel(p, moduleMap)}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <Switch
                                  color="success"
                                  isSelected={!!p.selected}
                                  onValueChange={(v) => {
                                    if (!currentRole) return;
                                    const label = buildPermisoLabel(p, moduleMap);
                                    ask({
                                      title: v ? "¿Activar este permiso?" : "¿Desactivar este permiso?",
                                      message: `Rol: ${currentRole.nombre}\nMódulo: ${currentModuleLabel}\nPermiso: ${label}`,
                                      confirmText: v ? "Activar" : "Desactivar",
                                      onConfirm: () =>
                                        toggle.mutate({
                                          roleId: currentRole.id,
                                          permisoId: p.id,
                                          enable: v,
                                          moduleId,
                                        }),
                                    });
                                  }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-sm opacity-60 py-6 text-center">
                    Seleccione un rol y/o módulo.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Surface>

      {/* Modales */}
      <RolInfoModal
        open={showInfo}
        onClose={() => setShowInfo(false)}
        rol={currentRole?.nombre ?? null}
        usersCount={currentRole ? roleUsersMap.get(currentRole.id) ?? 0 : 0}
        onEdit={(nuevo) =>
          currentRole &&
          nuevo &&
          nuevo.trim() &&
          nuevo.trim() !== currentRole.nombre &&
          ask({
            title: "Confirmar cambio de nombre",
            message: `¿Renombrar el rol "${currentRole.nombre}" a "${nuevo.trim()}"?`,
            confirmText: "Guardar",
            onConfirm: () =>
              crud.rename.mutate(
                { id: currentRole.id, nombre: nuevo.trim() },
                { onSuccess: () => setShowInfo(false) }
              ),
          })
        }
        onDelete={() =>
          currentRole &&
          ask({
            title: "¿Eliminar rol?",
            message:
              'Se enviará a "Eliminados". Si el rol tiene usuarios asociados, asegúrate de migrarlos antes.',
            confirmText: "Eliminar",
            onConfirm: () =>
              crud.remove.mutate(currentRole.id, {
                onSuccess: () => {
                  setShowInfo(false);
                  setRolId(null);
                },
              }),
          })
        }
      />

      <AddRoleModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={(name) =>
          crud.create.mutate(name, {
            onSuccess: () => setShowAdd(false),
          })
        }
        existing={rolesActivos.map((r) => r.nombre)}
      />

      {/* Diálogo global de confirmación */}
      <ConfirmDialog state={confirm} setState={setConfirm} isBusy={anyBusy} />
    </div>
  );
}
