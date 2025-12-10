import { Input, Select, SelectItem } from "@heroui/react";
import { Search } from "lucide-react";
import Surface from "../ui/Surface";
import SectionTitle from "../ui/SectionTitle";
import type { Cultivo } from "../model/types";

interface CultivosFiltersProps {
    q: string;
    setQ: (val: string) => void;
    loteId: number | undefined;
    setLoteId: (val: number | undefined) => void;
    tipoCultivoNombre: string | undefined;
    setTipoCultivoNombre: (val: string | undefined) => void;
    estado: Cultivo["estado"] | "";
    setEstado: (val: Cultivo["estado"] | "") => void;
    loteOptions: { key: string; label: string }[];
    tipoCultivoOptions: { key: string; label: string }[];
    estadoOptions: { key: string; label: string }[];
}

export default function CultivosFilters({
    q,
    setQ,
    loteId,
    setLoteId,
    tipoCultivoNombre,
    setTipoCultivoNombre,
    estado,
    setEstado,
    loteOptions,
    tipoCultivoOptions,
    estadoOptions,
}: CultivosFiltersProps) {
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

                {/* Lote */}
                <div>
                    <SectionTitle>Lote</SectionTitle>
                    <Select
                        aria-label="Filtrar por lote"
                        placeholder="Seleccione lote"
                        selectedKeys={new Set(loteId ? [loteId.toString()] : [""])}
                        onSelectionChange={(keys) => {
                            const k = (keys as Set<string>).values().next().value as string;
                            setLoteId(k === "" ? undefined : Number(k));
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

                {/* Tipo Cultivo */}
                <div>
                    <SectionTitle>Tipo de Cultivo</SectionTitle>
                    <Select
                        aria-label="Filtrar por tipo"
                        placeholder="Seleccione tipo"
                        selectedKeys={new Set(tipoCultivoNombre ? [tipoCultivoNombre] : [""])}
                        onSelectionChange={(keys) => {
                            const k = (keys as Set<string>).values().next().value as string;
                            setTipoCultivoNombre(k === "" ? undefined : k);
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

                {/* Estado */}
                <div>
                    <SectionTitle>Estado</SectionTitle>
                    <Select
                        aria-label="Filtrar por estado"
                        placeholder="Seleccione estado"
                        selectedKeys={new Set(estado ? [estado] : [""])}
                        onSelectionChange={(keys) => {
                            const k = (keys as Set<string>).values().next().value as string;
                            setEstado(k === "" ? "" : (k as Cultivo["estado"]));
                        }}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                        items={estadoOptions}
                    >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                </div>
            </div>
        </Surface>
    );
}
