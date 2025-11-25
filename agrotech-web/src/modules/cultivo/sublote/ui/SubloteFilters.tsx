import { Input, Select, SelectItem } from "@heroui/react";
import { Search } from "lucide-react";

type Props = {
  q: string;
  setQ: (v: string) => void;
  selectedLote: string;
  setSelectedLote: (v: string) => void;
  selectedSublote: string;
  setSelectedSublote: (v: string) => void;
  sublotes: {
    nombre_sublote: string;
    lote?: { nombre_lote: string } | null;
  }[];
};

export default function SubloteFilters({
  q,
  setQ,
  selectedLote,
  setSelectedLote,
  selectedSublote,
  setSelectedSublote,
  sublotes,
}: Props) {
  // 📍 Extraer nombres únicos de lotes y sublotes
  const nombresLotes = Array.from(
    new Set(
      sublotes
        .map((s) => s.lote?.nombre_lote)
        .filter((n): n is string => !!n)
    )
  );
  const nombresSublotes = Array.from(
    new Set(sublotes.map((s) => s.nombre_sublote).filter(Boolean))
  );

  // 📋 Agregar opción "Todos" al inicio
  const opcionesLotes = ["Todos", ...nombresLotes];
  const opcionesSublotes = ["Todos", ...nombresSublotes];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {/* 🔍 Buscar por nombre de sublote */}
      <Input
        startContent={<Search className="h-4 w-4 text-foreground-500" />}
        placeholder="Buscar por nombre de sublote…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        variant="bordered"
        label="Buscar"
      />

      {/* 🟫 Filtrar por lote */}
      <Select
        label="Nombre del lote"
        selectedKeys={new Set([selectedLote])}
        onSelectionChange={(keys) =>
          setSelectedLote(Array.from(keys)[0] as string)
        }
        variant="bordered"
      >
        {opcionesLotes.map((nombre) => (
          <SelectItem key={nombre}>{nombre}</SelectItem>
        ))}
      </Select>

      {/* 🟩 Filtrar por sublote */}
      <Select
        label="Nombre del sublote"
        selectedKeys={new Set([selectedSublote])}
        onSelectionChange={(keys) =>
          setSelectedSublote(Array.from(keys)[0] as string)
        }
        variant="bordered"
      >
        {opcionesSublotes.map((nombre) => (
          <SelectItem key={nombre}>{nombre}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
