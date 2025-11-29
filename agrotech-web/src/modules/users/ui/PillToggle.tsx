import { motion } from "framer-motion";
import { Users, Shield, Key } from "lucide-react";

export default function PillToggle({
  value,
  onChange,
}: {
  value: "users" | "roles" | "permissions";
  onChange: (v: "users" | "roles" | "permissions") => void;
}) {
  const options = [
    { value: "users" as const, icon: Users, label: "Usuarios" },
    { value: "roles" as const, icon: Shield, label: "Roles" },
    { value: "permissions" as const, icon: Key, label: "Permisos" },
  ];

  const index = options.findIndex((opt) => opt.value === value);

  return (
    <div className="relative flex overflow-hidden rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 p-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="relative z-10 px-4 py-2 text-sm flex items-center gap-2"
          >
            <Icon className="h-4 w-4" /> {opt.label}
          </button>
        );
      })}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-success/15"
        style={{
          left: `calc(${index * (100 / 3)}% + 4px)`,
          width: `calc(${100 / 3}% - 8px)`,
        }}
      />
    </div>
  );
}
