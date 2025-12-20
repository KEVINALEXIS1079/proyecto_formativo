import { Input, Select, SelectItem } from '@heroui/react';
import { Search } from 'lucide-react';
import type { TipoFormacion } from '../api/tipos-formacion.api';
import Surface from '@/modules/users/ui/Surface';
import SectionTitle from '@/modules/users/ui/SectionTitle';

export interface ProgramaFormacionFiltersState {
    q?: string;
    tipo?: string;
    estado?: string;
}

interface ProgramaFormacionFiltersProps {
    filters: ProgramaFormacionFiltersState;
    onChange: (filters: ProgramaFormacionFiltersState) => void;
    tipos: TipoFormacion[];
}

export function ProgramaFormacionFilters({ filters, onChange, tipos }: ProgramaFormacionFiltersProps) {
    return (
        <Surface className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Buscar */}
                <div className="col-span-1 md:col-span-2">
                    <SectionTitle>Buscar</SectionTitle>
                    <Input
                        placeholder="Buscar por ficha o nombre..."
                        value={filters.q || ''}
                        onValueChange={(value) => onChange({ ...filters, q: value })}
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
                        placeholder="Todos los tipos"
                        selectedKeys={filters.tipo ? [filters.tipo] : ['all']}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            const tipo = value === 'all' || !value ? '' : value;
                            onChange({ ...filters, tipo });
                        }}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                    >
                        {[
                            <SelectItem key="all" className="text-sm py-2">Todos</SelectItem>,
                            ...tipos.map((tipo) => (
                                <SelectItem key={tipo.codigo} className="text-sm py-2">
                                    {tipo.nombre}
                                </SelectItem>
                            ))
                        ]}
                    </Select>
                </div>

                {/* Estado Filter */}
                <div>
                    <SectionTitle>Estado</SectionTitle>
                    <Select
                        aria-label="Filtrar por estado"
                        placeholder="Todos los estados"
                        selectedKeys={filters.estado ? [filters.estado] : ['all']}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            const estado = value === 'all' || !value ? '' : value;
                            onChange({ ...filters, estado });
                        }}
                        variant="bordered"
                        radius="lg"
                        classNames={{
                            trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
                            value: "text-sm",
                        }}
                    >
                        <SelectItem key="all" className="text-sm py-2">Todos</SelectItem>
                        <SelectItem key="ACTIVO" className="text-sm py-2">Activo</SelectItem>
                        <SelectItem key="FINALIZADO" className="text-sm py-2">Finalizado</SelectItem>
                        <SelectItem key="SUSPENDIDO" className="text-sm py-2">Suspendido</SelectItem>
                    </Select>
                </div>
            </div>
        </Surface>
    );
}
