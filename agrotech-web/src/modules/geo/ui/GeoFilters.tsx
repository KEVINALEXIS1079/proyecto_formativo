import { Input } from "@heroui/react";
import { Search } from "lucide-react";
import Surface from "./Surface";
import SectionTitle from "./SectionTitle";
import type { ReactNode } from "react";

interface GeoFiltersProps {
  q: string;
  setQ: (val: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

export default function GeoFilters({ q, setQ, placeholder = "Buscar...", children }: GeoFiltersProps) {
  return (
    <Surface className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
        <div className="w-full md:w-auto min-w-[250px] flex-1">
          <SectionTitle>Buscar</SectionTitle>
          <Input
            placeholder={placeholder}
            value={q}
            onValueChange={setQ}
            startContent={<Search className="text-gray-400" size={16} />}
            variant="bordered"
            radius="lg"
            classNames={{
              inputWrapper: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
            }}
          />
        </div>
        {children}
      </div>
    </Surface>
  );
}
