import { Input, Select, SelectItem } from "@heroui/react";
import { Search } from "lucide-react";
import Surface from "./Surface";
import SectionTitle from "./SectionTitle";
import type { TipoEpaEnum } from "../models/types";

interface EpaFiltersProps {
  q: string;
  setQ: (val: string) => void;
  tipoEpaFilter: TipoEpaEnum | "todos";
  setTipoEpaFilter: (val: TipoEpaEnum | "todos") => void;
  tipoCultivoEpaId: number | undefined;
  setTipoCultivoEpaId: (val: number | undefined) => void;
  tiposCultivoEpa: { id: number; nombre: string }[];
}

export default function EpaFilters({
  q,
  setQ,
  tipoEpaFilter,
  setTipoEpaFilter,
  tipoCultivoEpaId,
  setTipoCultivoEpaId,
  tiposCultivoEpa,
}: EpaFiltersProps) {
  return (
    <Surface className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search */}
        <div className="col-span-1 md:col-span-2">
          <SectionTitle>Buscar</SectionTitle>
          <Input
            placeholder="Nombre, descripción..."
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

        {/* Tipo EPA Filter */}
        <div>
          <SectionTitle>Tipo EPA</SectionTitle>
          <Select
            aria-label="Filtrar por Tipo EPA"
            placeholder="Todos"
            selectedKeys={tipoEpaFilter !== "todos" ? [tipoEpaFilter] : ["todos"]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              setTipoEpaFilter(value as TipoEpaEnum | "todos");
            }}
            variant="bordered"
            radius="lg"
            classNames={{
              trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
              value: "text-sm",
            }}
          >
            <SelectItem key="todos" textValue="Todos">Todos</SelectItem>
            <SelectItem key="enfermedad" textValue="Enfermedad">Enfermedad</SelectItem>
            <SelectItem key="plaga" textValue="Plaga">Plaga</SelectItem>
            <SelectItem key="arvense" textValue="Arvencia">Arvencia</SelectItem>
          </Select>
        </div>

        {/* Cultivo Filter */}
        <div>
          <SectionTitle>Cultivo Afectado</SectionTitle>
          <Select
            aria-label="Filtrar por Cultivo"
            placeholder="Todos"
            selectedKeys={tipoCultivoEpaId ? [String(tipoCultivoEpaId)] : ["all"]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              setTipoCultivoEpaId(value === "all" ? undefined : Number(value));
            }}
            variant="bordered"
            radius="lg"
            classNames={{
              trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
              value: "text-sm",
            }}
          >
            <SelectItem key="all" textValue="Todos">Todos</SelectItem>
            {tiposCultivoEpa.map((tipo) => (
              <SelectItem key={String(tipo.id)} textValue={tipo.nombre}>
                {tipo.nombre}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </Surface>
  );
}
