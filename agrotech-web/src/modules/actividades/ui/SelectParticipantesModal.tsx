import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Chip,
} from "@heroui/react";
import { Search, User } from "lucide-react";
import { useUsuariosList } from "../hooks/useRelatedLists";
import { useDebounce } from "../hooks/useDebounce";
import type { Usuario } from "../model/types";

interface SelectParticipantesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: Usuario[]) => void;
  selectedIds: number[]; // IDs ya seleccionados para evitar duplicados
}

export default function SelectParticipantesModal({
  isOpen,
  onClose,
  onConfirm,
  selectedIds,
}: SelectParticipantesModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const debouncedSearch = useDebounce(search, 300);

  const { data: usuarios = [], isLoading } = useUsuariosList({
    q: debouncedSearch,
    limit: 100, // Aumentar límite para búsqueda
  });

  // Filtrar usuarios disponibles (no ya seleccionados)
  const availableUsers = useMemo(() => {
    return usuarios.filter(user => !selectedIds.includes(user.id));
  }, [usuarios, selectedIds]);

  // Reset selección cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers(new Set());
      setSearch("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const selected = availableUsers.filter(user => selectedUsers.has(user.id));
    onConfirm(selected);
    onClose();
  };

  const toggleUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    if (selectedUsers.size === availableUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(availableUsers.map(u => u.id)));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seleccionar Participantes
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              placeholder="Buscar por nombre, identificación o ID ficha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startContent={<Search className="h-4 w-4" />}
              className="w-full"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-default-600">
                {availableUsers.length} usuarios disponibles
              </span>
              <Button
                size="sm"
                variant="flat"
                onPress={selectAll}
                isDisabled={availableUsers.length === 0}
              >
                {selectedUsers.size === availableUsers.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </Button>
            </div>

            <Table
              aria-label="Tabla de usuarios"
              selectionMode="none"
              className="min-h-[400px]"
            >
              <TableHeader>
                <TableColumn width={50}>
                  <Checkbox
                    isSelected={availableUsers.length > 0 && selectedUsers.size === availableUsers.length}
                    onChange={selectAll}
                    isDisabled={availableUsers.length === 0}
                  />
                </TableColumn>
                <TableColumn>Nombre Completo</TableColumn>
                <TableColumn>Identificación</TableColumn>
                <TableColumn>ID Ficha</TableColumn>
                <TableColumn>Correo</TableColumn>
              </TableHeader>
              <TableBody
                items={availableUsers}
                isLoading={isLoading}
                emptyContent="No se encontraron usuarios"
              >
                {(user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        isSelected={selectedUsers.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.nombre} {user.apellido}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.cedula}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {user.idFicha}
                      </Chip>
                    </TableCell>
                    <TableCell>{user.correo}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {selectedUsers.size > 0 && (
              <div className="bg-default-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {selectedUsers.size} participante{selectedUsers.size !== 1 ? 's' : ''} seleccionado{selectedUsers.size !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-1">
                  {availableUsers
                    .filter(user => selectedUsers.has(user.id))
                    .map(user => (
                      <Chip
                        key={user.id}
                        size="sm"
                        variant="flat"
                        onClose={() => toggleUser(user.id)}
                        className="cursor-pointer"
                      >
                        {user.nombre} {user.apellido}
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
            isDisabled={selectedUsers.size === 0}
          >
            Agregar seleccionados ({selectedUsers.size})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}