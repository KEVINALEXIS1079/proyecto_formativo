// ui/LoteFilters.tsx
import { Input, Select, SelectItem } from "@heroui/react";
import { Search } from "lucide-react";

type Props = {
  q: string;
  setQ: (v: string) => void;
  selectedLote: string;
  setSelectedLote: (v: string) => void;
  lotes: { nombre_lote: string }[];
};

export default function LoteFilters({
  q,
  setQ,
  selectedLote,
  setSelectedLote,
  lotes,
}: Props) {
  const opciones = [{ nombre_lote: "Todos" }, ...lotes];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          label="Buscar"
          startContent={<Search className="h-4 w-4 text-foreground-500" />}
          placeholder="Buscar por nombre del lote…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          variant="bordered"
        />

        <Select
          label="Nombre del lote"
          selectedKeys={new Set([selectedLote])}
          onSelectionChange={(keys) =>
            setSelectedLote(Array.from(keys)[0] as string)
          }
          variant="bordered"
          items={opciones}
        >
          {(item) => (
            <SelectItem key={item.nombre_lote}>{item.nombre_lote}</SelectItem>
          )}
        </Select>
      </div>
    </div>
  );
}
