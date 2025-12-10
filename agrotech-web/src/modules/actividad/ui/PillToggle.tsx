import { motion } from "framer-motion";
import { LayoutGrid, Table } from "lucide-react";

export interface PillOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ElementType;
}

interface PillToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options?: PillOption<T>[];
}

export default function PillToggle<T extends string>({
  value,
  onChange,
  options = [],
}: PillToggleProps<T>) {
  // Default options if none provided (backward compatibility or default behavior)
  const finalOptions = options.length > 0 ? options : [
    { value: "actividades" as any, icon: LayoutGrid, label: "Actividades" },
    { value: "historial" as any, icon: Table, label: "Historial" },
  ];

  const index = finalOptions.findIndex((opt) => opt.value === value);

  return (
    <div
      className="relative grid items-center overflow-hidden rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 p-1 w-fit"
      style={{ gridTemplateColumns: `repeat(${finalOptions.length}, minmax(0, 1fr))` }}
    >
      {finalOptions.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 px-4 py-2 text-sm flex items-center justify-center gap-2 transition-colors duration-200 w-full ${isActive
              ? "text-success-800 dark:text-success-400 font-semibold"
              : "text-gray-600 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-gray-300"
              }`}
          >
            {Icon && <Icon className={`h-4 w-4 ${isActive ? "text-success-600 dark:text-success-400" : "text-gray-500"}`} />}
            <span className="whitespace-nowrap">{opt.label}</span>
          </button>
        );
      })}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-success/20 dark:bg-success/20 ring-1 ring-success/10 shadow-sm"
        style={{
          left: `calc(${index * (100 / finalOptions.length)}% + 4px)`,
          width: `calc(${100 / finalOptions.length}% - 8px)`,
        }}
      />
    </div>
  );
}
