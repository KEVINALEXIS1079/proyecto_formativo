import { Input, Select, SelectItem } from "@heroui/react";
import { Search } from "lucide-react";
import Surface from "../ui/Surface";
import SectionTitle from "../ui/SectionTitle";

interface CultivosHistorialFiltersProps {
    q: string;
    setQ: (val: string) => void;
    loteId: number | undefined;
    setLoteId: (val: number | undefined) => void;
    subLoteId: number | undefined;
    setSubLoteId: (val: number | undefined) => void;
    tipoCultivoNombre: string | undefined;
    setTipoCultivoNombre: (val: string | undefined) => void;
    loteOptions: { key: string; label: string }[];
    subLoteOptions: { key: string; label: string }[];
    tipoCultivoOptions: { key: string; label: string }[];
}

export default function CultivosHistorialFilters({
    q,
    setQ,
    loteId,
    setLoteId,
    subLoteId,
    setSubLoteId,
    tipoCultivoNombre,
    setTipoCultivoNombre,
    loteOptions,
    subLoteOptions,
    tipoCultivoOptions,
}: CultivosHistorialFiltersProps) {
    return (
        <Surface className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="col-span-1 md:col-span-1">
                    <SectionTitle>Buscar</SectionTitle>
                    <Input
                        placeholder="Buscar (cultivo, tipo, sublote)..."
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

                {/* Lote */}
                <div>
                    <SectionTitle>Filtrar por lote</SectionTitle>
                    <Select
                        aria-label="Filtrar por lote"
                        placeholder="Todos"
                        selectedKeys={new Set(loteId ? [loteId.toString()] : [])}
                        onSelectionChange={(keys) => {
                            const k = (keys as Set<string>).values().next().value as string;
                            const id = k ? Number(k) : undefined;
                            setLoteId(id);
                            if (!id) setSubLoteId(undefined); // Reset sublot if lot is cleared
                        }}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                        items={loteOptions}
                    >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                </div>

                {/* Sub-lote */}
                <div>
                    <SectionTitle>Sub-lote</SectionTitle>
                    <Select
                        aria-label="Filtrar por sub-lote"
                        placeholder="Todos"
                        selectedKeys={new Set(subLoteId ? [subLoteId.toString()] : [])}
                        onSelectionChange={(keys) => {
                            const k = (keys as Set<string>).values().next().value as string;
                            setSubLoteId(k ? Number(k) : undefined);
                        }}
                        isDisabled={!loteId || subLoteOptions.length === 0}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                        items={subLoteOptions}
                    >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                </div>

                {/* Tipo Cultivo */}
                <div>
                    <SectionTitle>Tipo de cultivo</SectionTitle>
                    <Select
                        aria-label="Filtrar por tipo"
                        placeholder="Todos"
                        selectedKeys={new Set(tipoCultivoNombre ? [tipoCultivoNombre] : [])}
                        onSelectionChange={(keys) => {
                            const k = (keys as Set<string>).values().next().value as string;
                            setTipoCultivoNombre(k || undefined);
                        }}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                        items={tipoCultivoOptions}
                    >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                </div>
            </div>
        </Surface>
    );
}
