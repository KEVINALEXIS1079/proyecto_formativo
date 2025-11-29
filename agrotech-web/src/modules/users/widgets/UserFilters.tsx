
import { useState, useEffect } from 'react';
import { useRoles } from '../hooks/usePermissions';
import { UserStatus } from '../models/types/user.types';
import { Search } from 'lucide-react';
import { Input, Select, SelectItem } from "@heroui/react";
import Surface from '../ui/Surface';
import SectionTitle from '../ui/SectionTitle';

interface UserFiltersProps {
  filters: {
    q?: string;
    rolId?: number;
    estado?: UserStatus;
  };
  onChange: (filters: { q?: string; rolId?: number; estado?: UserStatus }) => void;
}

export const UserFilters = ({ filters, onChange }: UserFiltersProps) => {
  const { data: roles = [] } = useRoles();
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

  const handleRoleChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    // If "all" is selected or value is empty, set to undefined
    const rolId = value === 'all' || !value ? undefined : Number(value);
    onChange({ ...filters, rolId });
  };

  const handleStatusChange = (keys: any) => {
    const value = Array.from(keys)[0] as string;
    // If "all" is selected or value is empty, set to undefined
    const estado = value === 'all' || !value ? undefined : (value as UserStatus);
    onChange({ ...filters, estado });
  };

  return (
    <Surface className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search */}
        <div className="col-span-1 md:col-span-2">
          <SectionTitle>Buscar</SectionTitle>
          <Input
            placeholder="Nombre, correo, identificación..."
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

        {/* Role Filter */}
        <div>
          <SectionTitle>Rol</SectionTitle>
          <Select
            aria-label="Filtrar por rol"
            placeholder="Todos los roles"
            selectedKeys={filters.rolId ? [String(filters.rolId)] : ['all']}
            onSelectionChange={handleRoleChange}
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
            <SelectItem key="all" className="text-sm py-2">Todos</SelectItem>
            {roles.map((rol) => (
              <SelectItem key={rol.id} className="text-sm py-2">
                {rol.nombre}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <SectionTitle>Estado</SectionTitle>
          <Select
            aria-label="Filtrar por estado"
            placeholder="Todos los estados"
            selectedKeys={filters.estado ? [filters.estado] : ['all']}
            onSelectionChange={handleStatusChange}
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
            <SelectItem key="all" className="text-sm py-2">Todos</SelectItem>
            <SelectItem key={UserStatus.ACTIVO} className="text-sm py-2">Activo</SelectItem>
            <SelectItem key={UserStatus.INACTIVO} className="text-sm py-2">Inactivo</SelectItem>
            <SelectItem key={UserStatus.BLOQUEADO} className="text-sm py-2">Bloqueado</SelectItem>
            <SelectItem key={UserStatus.PENDIENTE_VERIFICACION} className="text-sm py-2">Pendiente</SelectItem>
          </Select>
        </div>
      </div>
    </Surface>
  );
};

