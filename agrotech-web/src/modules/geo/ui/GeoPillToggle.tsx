import { motion } from "framer-motion";
import { Map, Grid } from "lucide-react";

export type GeoTab = "lotes" | "sublotes";

export default function GeoPillToggle({
  value,
  onChange,
}: {
  value: GeoTab;
  onChange: (v: GeoTab) => void;
}) {
  const options = [
    { value: "lotes" as const, icon: Map, label: "Lotes" },
    { value: "sublotes" as const, icon: Grid, label: "Sublotes" },
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
            className="relative z-10 px-6 py-2 text-sm flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200"
          >
            <Icon className="h-4 w-4" /> {opt.label}
          </button>
        );
      })}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600"
        style={{
          left: `calc(${index * 50}% + 4px)`,
          width: `calc(50% - 8px)`,
        }}
      />
    </div>
  );
}
