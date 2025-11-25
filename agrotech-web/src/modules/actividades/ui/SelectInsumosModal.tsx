import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Chip,
} from "@heroui/react";
import { Search, Package } from "lucide-react";
import { useInsumosList, useCategoriasInsumoList } from "../hooks/useRelatedLists";
import { useDebounce } from "../hooks/useDebounce";
import type { Insumo } from "../model/types";

interface SelectInsumosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: Insumo[]) => void;
  selectedIds: number[]; // IDs ya seleccionados para evitar duplicados
}

export default function SelectInsumosModal({
  isOpen,
  onClose,
  onConfirm,
  selectedIds,
}: SelectInsumosModalProps) {
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [selectedInsumos, setSelectedInsumos] = useState<Set<number>>(new Set());

  const debouncedSearch = useDebounce(search, 300);

  const { data: categorias = [] } = useCategoriasInsumoList({ q: "" });
  const { data: insumos = [], isLoading } = useInsumosList({
    q: debouncedSearch,
    categoriaId,
    limit: 100,
  });

  // Filtrar insumos disponibles (no ya seleccionados)
  const availableInsumos = useMemo(() => {
    return insumos.filter(insumo => !selectedIds.includes(insumo.id));
  }, [insumos, selectedIds]);

  // Reset selección cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedInsumos(new Set());
      setSearch("");
      setCategoriaId(undefined);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const selected = availableInsumos.filter(insumo => selectedInsumos.has(insumo.id));
    onConfirm(selected);
    onClose();
  };

  const toggleInsumo = (insumoId: number) => {
    const newSelected = new Set(selectedInsumos);
    if (newSelected.has(insumoId)) {
      newSelected.delete(insumoId);
    } else {
      newSelected.add(insumoId);
    }
    setSelectedInsumos(newSelected);
  };

  const selectAll = () => {
    if (selectedInsumos.size === availableInsumos.length) {
      setSelectedInsumos(new Set());
    } else {
      setSelectedInsumos(new Set(availableInsumos.map(i => i.id)));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Seleccionar Insumos
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Buscar por nombre de insumo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startContent={<Search className="h-4 w-4" />}
              />
              <Select
                label="Filtrar por categoría"
                selectedKeys={categoriaId ? new Set([String(categoriaId)]) : new Set()}
                onSelectionChange={(keys) => {
                  const k = Array.from(keys as Set<string>)[0];
                  setCategoriaId(k ? Number(k) : undefined);
                }}
                placeholder="Todas las categorías"
              >
                <SelectItem key="" textValue="Todas las categorías">
                  Todas las categorías
                </SelectItem>
                <>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} textValue={categoria.nombre}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-default-600">
                {availableInsumos.length} insumos disponibles
              </span>
              <Button
                size="sm"
                variant="flat"
                onPress={selectAll}
                isDisabled={availableInsumos.length === 0}
              >
                {selectedInsumos.size === availableInsumos.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </Button>
            </div>

            <Table
              aria-label="Tabla de insumos"
              selectionMode="none"
              className="min-h-[400px]"
            >
              <TableHeader>
                <TableColumn width={50}>
                  <Checkbox
                    isSelected={availableInsumos.length > 0 && selectedInsumos.size === availableInsumos.length}
                    onChange={selectAll}
                    isDisabled={availableInsumos.length === 0}
                  />
                </TableColumn>
                <TableColumn>Nombre del Insumo</TableColumn>
                <TableColumn>Categoría</TableColumn>
                <TableColumn>Stock Actual</TableColumn>
                <TableColumn>Unidad Base</TableColumn>
              </TableHeader>
              <TableBody
                items={availableInsumos}
                isLoading={isLoading}
                emptyContent="No se encontraron insumos"
              >
                {(insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell>
                      <Checkbox
                        isSelected={selectedInsumos.has(insumo.id)}
                        onChange={() => toggleInsumo(insumo.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{insumo.nombre}</span>
                        {insumo.descripcion && (
                          <span className="text-small text-default-500">{insumo.descripcion}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {insumo.categoria ? (
                        <Chip size="sm" variant="flat">
                          {insumo.categoria.nombre}
                        </Chip>
                      ) : (
                        <span className="text-default-400">Sin categoría</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{insumo.stockTotalBase || 0}</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {insumo.unidadBase || 'N/A'}
                      </Chip>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {selectedInsumos.size > 0 && (
              <div className="bg-default-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {selectedInsumos.size} insumo{selectedInsumos.size !== 1 ? 's' : ''} seleccionado{selectedInsumos.size !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-1">
                  {availableInsumos
                    .filter(insumo => selectedInsumos.has(insumo.id))
                    .map(insumo => (
                      <Chip
                        key={insumo.id}
                        size="sm"
                        variant="flat"
                        onClose={() => toggleInsumo(insumo.id)}
                        className="cursor-pointer"
                      >
                        {insumo.nombre}
                      </Chip>
                    ))}
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleConfirm}
            isDisabled={selectedInsumos.size === 0}
          >
            Agregar seleccionados ({selectedInsumos.size})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}