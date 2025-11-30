import { motion } from "framer-motion";
import { List, Bug, Sprout } from "lucide-react";

export type EpaTab = "epas" | "tipos-epa" | "tipos-cultivo";

export default function EpaPillToggle({
  value,
  onChange,
}: {
  value: EpaTab;
  onChange: (v: EpaTab) => void;
}) {
  const options = [
    { value: "epas" as const, icon: List, label: "Listado EPAs" },
    { value: "tipos-epa" as const, icon: Bug, label: "Tipos de EPA" },
    { value: "tipos-cultivo" as const, icon: Sprout, label: "Tipos de Cultivo" },
  ];

  const index = options.findIndex((opt) => opt.value === value);

  return (
    <div className="relative flex overflow-hidden rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 p-1 w-fit">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
              value === opt.value ? "text-success-700 font-medium" : "text-default-500 hover:text-default-700"
            }`}
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
