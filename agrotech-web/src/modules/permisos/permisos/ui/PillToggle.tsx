import { motion } from "framer-motion";
import { User, Shield } from "lucide-react";
export default function PillToggle({
  value, onChange,
}: { value: "usuario" | "rol"; onChange: (v: "usuario" | "rol") => void; }) {
  const index = value === "usuario" ? 0 : 1;
  return (
    <div className="relative flex overflow-hidden rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 p-1">
      <button onClick={() => onChange("usuario")} className="relative z-10 px-4 py-2 text-sm flex items-center gap-2">
        <User className="h-4 w-4" /> Usuario → Permiso
      </button>
      <button onClick={() => onChange("rol")} className="relative z-10 px-4 py-2 text-sm flex items-center gap-2">
        <Shield className="h-4 w-4" /> Rol → Permiso
      </button>
      <motion.span layout transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="pointer-events-none absolute top-1 bottom-1 w-1/2 rounded-full bg-success/15"
        style={{ left: index === 0 ? "4px" : "calc(50% + 4px)" }}/>
    </div>
  );
}
