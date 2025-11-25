import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Surface from "../ui/Surface";
import PillToggle from "../ui/PillToggle";
import PermisosPorUsuario from "../features/PermisosPorUsuario";
import PermisosPorRol from "../features/PermisosPorRol";

/** Orquesta los dos modos. Si tu lista de usuarios viene por otro hook, pásala como prop a PermisosPorUsuario */
export default function ListaPermisosPage() {
  const [mode, setMode] = useState<"usuario" | "rol">("usuario");

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Gestión de permisos</h1>
          <p className="text-sm opacity-70">Desliza entre Usuario→Permiso y Rol→Permiso</p>
        </div>
        <PillToggle value={mode} onChange={setMode} />
      </div>

      <Surface className="overflow-hidden p-0">
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ x: mode === "usuario" ? -24 : 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: mode === "usuario" ? 24 : -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              {mode === "usuario" ? <PermisosPorUsuario /> : <PermisosPorRol />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>
    </div>
  );
}
