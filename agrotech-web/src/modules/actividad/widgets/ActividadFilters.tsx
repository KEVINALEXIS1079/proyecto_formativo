import { Input, Select, SelectItem } from "@heroui/react";
import { Search } from "lucide-react";
import Surface from "../ui/Surface";
import SectionTitle from "../ui/SectionTitle";

interface ActividadFiltersProps {
    q: string;
    setQ: (val: string) => void;
    tipo: string;
    setTipo: (val: string) => void;
    desde: string;
    setDesde: (val: string) => void;
    hasta: string;
    setHasta: (val: string) => void;
    tipos: string[];
}

export default function ActividadFilters({
    q,
    setQ,
    tipo,
    setTipo,
    desde,
    setDesde,
    hasta,
    setHasta,
    tipos
}: ActividadFiltersProps) {
    return (
        <Surface className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="col-span-1 md:col-span-1">
                    <SectionTitle>Buscar</SectionTitle>
                    <Input
                        placeholder="Buscar..."
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

                {/* Tipo Filter */}
                <div>
                    <SectionTitle>Tipo</SectionTitle>
                    <Select
                        aria-label="Filtrar por tipo"
                        placeholder="Todos"
                        selectedKeys={tipo ? [tipo] : []}
                        onSelectionChange={(keys) => setTipo(Array.from(keys)[0] as string)}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                    >
                        {tipos.map((t) => (
                            <SelectItem key={t}>{t}</SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Desde */}
                <div>
                    <SectionTitle>Desde</SectionTitle>
                    <Input
                        type="date"
                        aria-label="Fecha desde"
                        value={desde}
                        onValueChange={setDesde}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            inputWrapper: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                        }}
                    />
                </div>

                {/* Hasta */}
                <div>
                    <SectionTitle>Hasta</SectionTitle>
                    <Input
                        type="date"
                        aria-label="Fecha hasta"
                        value={hasta}
                        onValueChange={setHasta}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            inputWrapper: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                        }}
                    />
                </div>
            </div>
        </Surface>
    );
}
