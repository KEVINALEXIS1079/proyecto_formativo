import React from 'react';
import { Select, SelectItem } from "@heroui/react";
import Surface from "../ui/Surface";
import { SectionTitle } from "@/modules/iot/ui/SectionTitle";

interface IoTFiltersProps {
    selectedLoteId: number | null;
    setSelectedLoteId: (id: number | null) => void;
    selectedSubLoteId: number | null;
    setSelectedSubLoteId: (id: number | null) => void;
    lotes: any[];
    subLotes: any[];
}

export const IoTFilters: React.FC<IoTFiltersProps> = ({
    selectedLoteId,
    setSelectedLoteId,
    selectedSubLoteId,
    setSelectedSubLoteId,
    lotes,
    subLotes
}) => {
    return (
        <Surface className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                {/* Lote */}
                <div>
                    <SectionTitle>Filtrar por lote</SectionTitle>
                    <Select
                        aria-label="Filtrar por lote"
                        placeholder="Todos los Lotes"
                        selectedKeys={selectedLoteId ? [selectedLoteId.toString()] : ['all']}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedLoteId(val === 'all' ? null : parseInt(val));
                            setSelectedSubLoteId(null);
                        }}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                    >
                        {[<SelectItem key="all">Todos los Lotes</SelectItem>, ...lotes.map((l: any) => <SelectItem key={l.id}>{l.nombre}</SelectItem>)]}
                    </Select>
                </div>

                {/* SubLote */}
                <div>
                    <SectionTitle>Filtrar por sub-lote</SectionTitle>
                    <Select
                        aria-label="Filtrar por sub-lote"
                        placeholder="Todos"
                        selectedKeys={selectedSubLoteId ? [selectedSubLoteId.toString()] : []}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setSelectedSubLoteId(isNaN(val) ? null : val);
                        }}
                        isDisabled={!selectedLoteId || subLotes.length === 0}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                    >
                        {subLotes.map((sl: any) => (
                            <SelectItem key={sl.id}>{sl.nombre}</SelectItem>
                        ))}
                    </Select>
                </div>
            </div>
        </Surface>
    );
};
