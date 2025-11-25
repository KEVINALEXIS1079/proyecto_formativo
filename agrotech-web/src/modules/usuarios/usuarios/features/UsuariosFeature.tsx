// src/modules/usuarios/usuarios/features/UsuariosFeature.tsx
import { useMemo, useState, useCallback } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Tab, Tabs } from "@heroui/react";
import Section from "../widgets/Section";
import UserToolbar from "../widgets/UserToolbar";
import UserTable from "../widgets/UserTable";
import UserDetailModal from "../widgets/UserDetailModal";
import UserEditModal from "../widgets/UserEditModal";
import {
  useRolesLite,
  useUsuarioRemove,
  useUsuarioRestore,
  useUsuarioToggleEstado,
  useUsuarioUpdate,
  useUsuariosList,
} from "../hooks/useUsuarios";
import { useUsuarioRealtime } from "../hooks/useUsuarioRealtime";
import type { UsuarioLite } from "../model/types";
import { motion, AnimatePresence } from "framer-motion";

/* =========================
 * Variants
 * ========================= */
const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  // cast transition to any because Framer Motion's `ease` typing doesn't accept number[] here
  show: { opacity: 1, y: 0, transition: ({ duration: 0.28, ease: [0.0, 0.0, 0.2, 1] } as any) },
};

const fadeIn = {
  hidden: { opacity: 0 },
  // cast transition to any because Framer Motion's `ease` typing doesn't accept number[] here
  show: { opacity: 1, transition: ({ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] } as any) },
};

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const hoverCard = {
  rest: { y: 0, scale: 1 },
  // cast transition to any because Framer Motion's Transition typing is strict
  hover: { y: -3, scale: 1.01, transition: ({ type: "spring", stiffness: 220, damping: 18 } as any) },
};

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
  console.log("ConfirmDialog render, open:", state.open, "title:", state.title);
  const onClose = () => setState({ ...state, open: false });

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

export default function UsuariosFeature() {
  const [tab, setTab] = useState<"gestionar" | "restaurar">("gestionar");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // 🔴 Suscripción WS para invalidar cache cuando cambie la lista
  useUsuarioRealtime();

  const { data, isLoading } = useUsuariosList({ page, q, tab });
  const items: UsuarioLite[] = useMemo(() => data?.items ?? [], [data]);
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / rowsPerPage));

  const { data: rolesResp } = useRolesLite();
  const roles = rolesResp?.items ?? [];

  const [ver, setVer] = useState<UsuarioLite | null>(null);
  const [editar, setEditar] = useState<UsuarioLite | null>(null);

  const toggleEstado = useUsuarioToggleEstado();
  const delUser = useUsuarioRemove();
  const restore = useUsuarioRestore();
  const updUser = useUsuarioUpdate();

  // Estado para diálogo de confirmación
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
  });

  // Helper para abrir confirm con defaults
  const ask = useCallback(
    (cfg: Omit<ConfirmState, "open">) => {
      console.log("ask called with:", cfg);
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

  // Cargando de cualquier mutación que use el modal
  const anyBusy = delUser.isPending || restore.isPending || updUser.isPending;

  return (
    <Section title="Gestión de usuarios">
      <motion.div initial="hidden" animate="show" variants={fadeIn}>
        <Tabs
          selectedKey={tab}
          onSelectionChange={(k) => {
            setTab(k as any);
            setPage(1);
          }}
        >
          <Tab key="gestionar" title="Gestionar" />
          <Tab key="restaurar" title="Restaurar" />
        </Tabs>
      </motion.div>

      {/* Paneles con transición entre tabs */}
      <AnimatePresence mode="wait">
        {tab === "gestionar" ? (
          <motion.div
            key="panel-gestionar"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, x: 12, transition: { duration: 0.2 } }}
            className="mt-4"
          >
            <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-4">
              <motion.div variants={fadeInUp}>
                <UserToolbar
                  q={q}
                  setQ={(v) => {
                    setQ(v);
                    setPage(1);
                  }}
                />
              </motion.div>

              <motion.div variants={hoverCard} initial="rest" whileHover="hover" className="rounded-xl">
                {isLoading ? (
                  <motion.div className="py-8 text-center text-default-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Cargando...
                  </motion.div>
                ) : (
                  <motion.div variants={fadeInUp}>
                    <UserTable items={items} onView={setVer} />
                  </motion.div>
                )}
              </motion.div>

              <motion.div className="flex justify-end" variants={fadeInUp}>
                <Pagination page={page} total={pages} onChange={setPage} showShadow />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="panel-restaurar"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
            className="mt-4"
          >
            <motion.div variants={fadeInUp} initial="hidden" animate="show">
              <p className="text-default-500 text-sm">Lista de usuarios eliminados para restauración.</p>
            </motion.div>

            <motion.div variants={hoverCard} initial="rest" whileHover="hover" className="mt-4 rounded-xl">
              {isLoading ? (
                <motion.div className="py-8 text-center text-default-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Cargando...
                </motion.div>
              ) : (
                <motion.div variants={fadeInUp} initial="hidden" animate="show">
                  <UserTable items={items} onView={setVer} />
                </motion.div>
              )}
            </motion.div>

            <motion.div className="mt-4 flex justify-end" variants={fadeInUp} initial="hidden" animate="show">
              <Pagination page={page} total={pages} onChange={setPage} showShadow />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de detalles: confirmamos eliminar/restaurar y permitir toggle estado directo */}
      <UserDetailModal
        user={ver}
        isOpen={!!ver}
        onClose={() => setVer(null)}
        onEdit={(u) => {
          setEditar(u);
          setVer(null);
        }}
        onToggleEstado={(u) =>
          // Toggle estado sin confirmación (si quieres, también se puede confirmar)
          toggleEstado.mutate({ id: u.id, to: u.estado === "activo" ? "inactivo" : "activo" })
        }
        onDelete={(u) => {
          ask({
            title: "¿Eliminar usuario?",
            message: `Esta acción moverá a "${u.nombre && u.apellido ? `${u.nombre} ${u.apellido}` : `ID ${u.id}`}" a la papelera.`,
            confirmText: "Eliminar",
            onConfirm: () => delUser.mutate(u.id, { onSuccess: () => setVer(null) }),
          });
        }}
        onRestore={(u) => {
          ask({
            title: "¿Restaurar usuario?",
            message: `Se restaurará el acceso de "${u.nombre && u.apellido ? `${u.nombre} ${u.apellido}` : `ID ${u.id}`}".`,
            confirmText: "Restaurar",
            onConfirm: () => restore.mutate(u.id, { onSuccess: () => setVer(null) }),
          });
        }}
      />

      {/* Modal de edición: confirmamos antes de enviar */}
      <UserEditModal
        user={editar}
        roles={roles}
        isOpen={!!editar}
        onClose={() => setEditar(null)}
        onSubmit={({ id, dto }) => {
          ask({
            title: "Confirmar cambios",
            message: "¿Deseas guardar los cambios realizados a este usuario?",
            confirmText: "Guardar cambios",
            onConfirm: () => updUser.mutate({ id, dto }, { onSuccess: () => setEditar(null) }),
          });
        }}
      />

      {/* Diálogo de confirmación global */}
      <ConfirmDialog state={confirm} setState={setConfirm} isBusy={anyBusy} />
    </Section>
  );
}
