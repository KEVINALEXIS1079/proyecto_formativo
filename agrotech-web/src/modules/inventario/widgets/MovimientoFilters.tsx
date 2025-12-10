import { useState, useEffect } from 'react';
import { useInsumoList } from '../hooks/useInsumoList';
import { Search } from 'lucide-react';
import { Input, Select, SelectItem } from "@heroui/react";
import Surface from '../../users/ui/Surface';
import SectionTitle from '../../users/ui/SectionTitle';
import type { MovimientoFilters as MovimientoFiltersType } from '../model/types';
import type { TipoMovimiento } from '../model/types';

interface MovimientoFiltersProps {
  filters: MovimientoFiltersType;
  onChange: (filters: MovimientoFiltersType) => void;
}

const tiposMovimiento: { value: TipoMovimiento; label: string }[] = [
  { value: 'REGISTRO', label: 'Registro' },
  { value: 'AJUSTE', label: 'Ajuste' },
  { value: 'CONSUMO', label: 'Consumo' },
  { value: 'TRASLADO', label: 'Traslado' },
  { value: 'ELIMINACION', label: 'Eliminación' },
  { value: 'INICIAL', label: 'Inicial' },
];

export const MovimientoFilters = ({ filters, onChange }: MovimientoFiltersProps) => {
  const { data: insumosResponse } = useInsumoList({ limit: 100 }); // Obtener todos los insumos para filtrar
  const insumos = insumosResponse?.items ?? [];
  const [searchTerm, setSearchTerm] = useState(filters.q || '');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.q) {
        onChange({ ...filters, q: searchTerm });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters, onChange]);

  const handleTipoMovimientoChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    const tipoMovimiento = value === 'all' || !value ? undefined : value as TipoMovimiento;
    onChange({ ...filters, tipoMovimiento });
  };

  const handleInsumoChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    const idInsumo = value === 'all' || !value ? undefined : Number(value);
    onChange({ ...filters, idInsumo });
  };

  const handleFechaDesdeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fechaDesde = event.target.value || undefined;
    onChange({ ...filters, fechaDesde });
  };

  const handleFechaHastaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fechaHasta = event.target.value || undefined;
    onChange({ ...filters, fechaHasta });
  };

  return (
    <Surface className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        {/* Search */}
        <div className="col-span-1 md:col-span-2">
          <SectionTitle>Buscar</SectionTitle>
          <Input
            placeholder="Descripción, usuario..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={<Search className="text-gray-400" size={16} />}
            variant="bordered"
            radius="lg"
            classNames={{
              inputWrapper: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
            }}
          />
        </div>

        {/* Tipo Movimiento Filter */}
        <div>
          <SectionTitle>Tipo</SectionTitle>
          <Select
            aria-label="Filtrar por tipo de movimiento"
            placeholder="Todos los tipos"
            selectedKeys={filters.tipoMovimiento ? [filters.tipoMovimiento] : ['all']}
            onSelectionChange={handleTipoMovimientoChange}
            variant="bordered"
            radius="lg"
            popoverProps={{
              placement: "bottom",
              offset: 8,
              classNames: { content: "max-h-80 overflow-auto" },
            }}
            classNames={{
              trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
              value: "text-sm",
              popoverContent: "rounded-xl min-w-[18rem] max-h-80 overflow-auto",
              listbox: "max-h-80 overflow-auto",
            }}
          >
            {[
              <SelectItem key="all" textValue="Todos" className="text-sm py-2">Todos</SelectItem>,
              ...tiposMovimiento.map((tipo) => (
                <SelectItem key={tipo.value} textValue={tipo.label} className="text-sm py-2">
                  {tipo.label}
                </SelectItem>
              ))
            ]}
          </Select>
        </div>

        {/* Fecha Desde */}
        <div>
          <SectionTitle>Desde</SectionTitle>
          <Input
            type="date"
            aria-label="Fecha desde"
            placeholder="Seleccionar fecha"
            value={filters.fechaDesde || ''}
            onChange={handleFechaDesdeChange}
            variant="bordered"
            radius="lg"
            classNames={{
              inputWrapper: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
            }}
          />
        </div>

        {/* Fecha Hasta */}
        <div>
          <SectionTitle>Hasta</SectionTitle>
          <Input
            type="date"
            aria-label="Fecha hasta"
            placeholder="Seleccionar fecha"
            value={filters.fechaHasta || ''}
            onChange={handleFechaHastaChange}
            variant="bordered"
            radius="lg"
            classNames={{
              inputWrapper: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
            }}
          />
        </div>

        {/* Insumo Filter (opcional) */}
        <div>
          <SectionTitle>Insumo (opcional)</SectionTitle>
          <Select
            aria-label="Filtrar por insumo"
            placeholder="Todos los insumos"
            selectedKeys={filters.idInsumo ? [String(filters.idInsumo)] : ['all']}
            onSelectionChange={handleInsumoChange}
            variant="bordered"
            radius="lg"
            popoverProps={{
              placement: "bottom",
              offset: 8,
              classNames: { content: "max-h-80 overflow-auto" },
            }}
            classNames={{
              trigger: "h-11 px-4 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10",
              value: "text-sm",
              popoverContent: "rounded-xl min-w-[18rem] max-h-80 overflow-auto",
              listbox: "max-h-80 overflow-auto",
            }}
          >
            {[
              <SelectItem key="all" textValue="Todos" className="text-sm py-2">Todos</SelectItem>,
              ...insumos.map((insumo) => (
                <SelectItem key={insumo.id} textValue={insumo.nombre} className="text-sm py-2">
                  {insumo.nombre}
                </SelectItem>
              ))
            ]}
          </Select>
        </div>
      </div>
    </Surface>
  );
};