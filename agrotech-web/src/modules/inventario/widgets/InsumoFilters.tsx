import { useState, useEffect } from 'react';
import { useCategoriaInsumoList } from '../hooks/useCategoriaInsumoList';
import { useProveedorList } from '../hooks/useProveedorList';
import { useAlmacenList } from '../hooks/useAlmacenList';
import { Search } from 'lucide-react';
import { Input, Select, SelectItem } from "@heroui/react";
import Surface from '../../users/ui/Surface';
import SectionTitle from '../../users/ui/SectionTitle';
import type { InsumoFilters as InsumoFiltersType } from '../model/types';

interface InsumoFiltersProps {
  filters: InsumoFiltersType;
  onChange: (filters: InsumoFiltersType) => void;
}

export const InsumoFilters = ({ filters, onChange }: InsumoFiltersProps) => {
  const { data: categorias = [] } = useCategoriaInsumoList();
  const { data: proveedores = [] } = useProveedorList();
  const { data: almacenes = [] } = useAlmacenList();
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

  const handleCategoriaChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    const categoriaId = value === 'all' || !value ? undefined : Number(value);
    onChange({ ...filters, categoriaId });
  };

  const handleProveedorChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    const proveedorId = value === 'all' || !value ? undefined : Number(value);
    onChange({ ...filters, proveedorId });
  };

  const handleAlmacenChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    const almacenId = value === 'all' || !value ? undefined : Number(value);
    onChange({ ...filters, almacenId });
  };

  return (
    <Surface className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Search */}
        <div className="col-span-1 md:col-span-2">
          <SectionTitle>Buscar</SectionTitle>
          <Input
            placeholder="Nombre, descripción..."
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

        {/* Categoria Filter */}
        <div>
          <SectionTitle>Categoría</SectionTitle>
          <Select
            aria-label="Filtrar por categoría"
            placeholder="Todas las categorías"
            selectedKeys={filters.categoriaId ? [String(filters.categoriaId)] : ['all']}
            onSelectionChange={handleCategoriaChange}
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
              <SelectItem key="all" textValue="Todas" className="text-sm py-2">Todas</SelectItem>,
              ...categorias.map((categoria) => (
                <SelectItem key={categoria.id} textValue={categoria.nombre} className="text-sm py-2">
                  {categoria.nombre}
                </SelectItem>
              ))
            ]}
          </Select>
        </div>

        {/* Proveedor Filter */}
        <div>
          <SectionTitle>Proveedor</SectionTitle>
          <Select
            aria-label="Filtrar por proveedor"
            placeholder="Todos los proveedores"
            selectedKeys={filters.proveedorId ? [String(filters.proveedorId)] : ['all']}
            onSelectionChange={handleProveedorChange}
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
              ...proveedores.map((proveedor) => (
                <SelectItem key={proveedor.id} textValue={proveedor.nombre} className="text-sm py-2">
                  {proveedor.nombre}
                </SelectItem>
              ))
            ]}
          </Select>
        </div>

        {/* Almacen Filter */}
        <div>
          <SectionTitle>Almacén</SectionTitle>
          <Select
            aria-label="Filtrar por almacén"
            placeholder="Todos los almacenes"
            selectedKeys={filters.almacenId ? [String(filters.almacenId)] : ['all']}
            onSelectionChange={handleAlmacenChange}
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
              ...almacenes.map((almacen) => (
                <SelectItem key={almacen.id} textValue={almacen.nombre} className="text-sm py-2">
                  {almacen.nombre}
                </SelectItem>
              ))
            ]}
          </Select>
        </div>
      </div>
    </Surface>
  );
};