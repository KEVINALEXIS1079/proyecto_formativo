import { Input } from "@heroui/react";
import { Search } from "lucide-react";
import Surface from "../ui/Surface";

export interface RoleFiltersState {
    q?: string;
}

interface RoleFiltersProps {
    filters: RoleFiltersState;
    onChange: (filters: RoleFiltersState) => void;
}

export const RoleFilters = ({ filters, onChange }: RoleFiltersProps) => {
    const handleSearchChange = (value: string) => {
        onChange({ ...filters, q: value });
    };

    return (
        <Surface className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="col-span-1 md:col-span-4">
                    <Input
                        placeholder="Buscar por nombre..."
                        startContent={<Search className="text-gray-400" size={16} />}
                        value={filters.q || ''}
                        onValueChange={handleSearchChange}
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
};
