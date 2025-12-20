import React, { useState } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    Chip,
    Spinner,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    User as UserAvatar,
} from '@heroui/react';
import { Edit, Trash2, Users, Eye } from 'lucide-react';
import { useProgramasFormacion } from '../hooks/useProgramasFormacion';
import { useTiposFormacion } from '../hooks/useTiposFormacion';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { ProgramaFormacion } from '../api/programas-formacion.api';
import { ProgramaFormacionFilters, type ProgramaFormacionFiltersState } from '../widgets/ProgramaFormacionFilters';

interface ProgramasFormacionListProps {
    onEdit: (programa: ProgramaFormacion) => void;
    onCreate: () => void;
    onDelete: (programa: ProgramaFormacion) => void;
}

export default function ProgramasFormacionList({ onEdit, onCreate, onDelete }: ProgramasFormacionListProps) {
    const { can } = useAuth();
    const [filters, setFilters] = useState<ProgramaFormacionFiltersState>({ tipo: '', estado: '', q: '' });
    const [selectedPrograma, setSelectedPrograma] = useState<ProgramaFormacion | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: programas, isLoading } = useProgramasFormacion(filters);
    const { data: tipos } = useTiposFormacion();

    const canEdit = can('programas_formacion.editar');
    const canDelete = can('programas_formacion.eliminar');

    const handleViewApprentices = (programa: ProgramaFormacion) => {
        setSelectedPrograma(programa);
        setIsModalOpen(true);
    };

    const getTipoColor = (tipo: string) => {
        const colors: Record<string, any> = {
            TECNICO: 'primary',
            TECNOLOGO: 'secondary',
            COMPLEMENTARIA: 'success',
            CURSO: 'warning',
        };
        return colors[tipo] || 'default';
    };

    const getEstadoColor = (estado: string) => {
        const colors: Record<string, any> = {
            ACTIVO: 'success',
            FINALIZADO: 'default',
            SUSPENDIDO: 'danger',
        };
        return colors[estado] || 'default';
    };

    const columns = [
        { key: 'ficha', label: 'FICHA' },
        { key: 'programa', label: 'PROGRAMA' },
        { key: 'tipo', label: 'TIPO' },
        { key: 'aprendices', label: 'APRENDICES', align: 'center' },
        { key: 'estado', label: 'ESTADO', align: 'center' },
        ...(canEdit || canDelete ? [{ key: 'acciones', label: 'ACCIONES', align: 'end' }] : []),
    ];

    const renderCell = (programa: ProgramaFormacion, columnKey: React.Key) => {
        switch (columnKey) {
            case 'ficha':
                return (
                    <Chip variant="flat" color="primary" size="sm">
                        {programa.numeroFicha}
                    </Chip>
                );
            case 'programa':
                return (
                    <div className="flex flex-col">
                        <p className="text-medium">{programa.nombre}</p>
                        {programa.descripcion && (
                            <span className="text-small text-default-500">
                                {programa.descripcion.substring(0, 50)}
                                {programa.descripcion.length > 50 && '...'}
                            </span>
                        )}
                    </div>
                );
            case 'tipo':
                return (
                    <Chip color={getTipoColor(programa.tipo)} variant="flat" size="sm">
                        {programa.tipo}
                    </Chip>
                );
            case 'aprendices':
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Users size={16} className="text-default-400" />
                        <span className="text-small">
                            {programa.usuarios ? programa.usuarios.length : programa.cantidadAprendices}
                        </span>
                    </div>
                );
            case 'estado':
                return (
                    <Chip color={getEstadoColor(programa.estado)} variant="flat" size="sm">
                        {programa.estado}
                    </Chip>
                );
            case 'acciones':
                return (
                    <div className="relative flex items-center justify-end gap-2">
                        <Tooltip content="Ver aprendices">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-default-600 transition-colors"
                                onClick={() => handleViewApprentices(programa)}
                            >
                                <Eye size={18} />
                            </span>
                        </Tooltip>
                        {canEdit && (
                            <Tooltip content="Editar programa">
                                <span
                                    className="text-lg text-[#17C964] cursor-pointer active:opacity-50 hover:text-[#12A150] transition-colors"
                                    onClick={() => onEdit(programa)}
                                >
                                    <Edit size={18} />
                                </span>
                            </Tooltip>
                        )}
                        {canDelete && (
                            <Tooltip color="danger" content="Eliminar programa">
                                <span
                                    className="text-lg text-danger cursor-pointer active:opacity-50 hover:text-danger-400 transition-colors"
                                    onClick={() => onDelete(programa)}
                                >
                                    <Trash2 size={18} />
                                </span>
                            </Tooltip>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col">
            <ProgramaFormacionFilters filters={filters} onChange={setFilters} tipos={tipos || []} />

            <Table
                aria-label="Tabla de programas de formación"
                classNames={{
                    wrapper: "min-h-[400px] shadow-sm border border-divider rounded-xl",
                    th: "bg-default-50 text-default-600 font-medium",
                    td: "group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none"
                }}
            >
                <TableHeader columns={columns}>
                    {(column: any) => (
                        <TableColumn key={column.key} align={column.align || 'start'}>
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={programas || []} emptyContent="No hay programas registrados.">
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => (
                                <TableCell>{renderCell(item, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Modal de Aprendices */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="3xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h3 className="text-xl font-bold">Aprendices Inscritos</h3>
                                <p className="text-sm text-default-500">
                                    {selectedPrograma?.nombre} - Ficha: {selectedPrograma?.numeroFicha}
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                {selectedPrograma?.usuarios && selectedPrograma.usuarios.length > 0 ? (
                                    <Table removeWrapper aria-label="Tabla de aprendices">
                                        <TableHeader>
                                            <TableColumn>NOMBRE</TableColumn>
                                            <TableColumn>DOCUMENTO</TableColumn>
                                            <TableColumn>CORREO</TableColumn>
                                            <TableColumn>ESTADO</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedPrograma.usuarios.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <UserAvatar
                                                            name={`${user.nombre} ${user.apellido}`}
                                                            description={user.rol?.nombre || 'Aprendiz'}
                                                            avatarProps={{
                                                                size: "sm",
                                                                src: user.avatarUrl
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{user.identificacion}</TableCell>
                                                    <TableCell>{user.correo}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={user.estado === 'activo' ? 'success' : 'danger'}
                                                        >
                                                            {user.estado.toUpperCase()}
                                                        </Chip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-default-500">
                                        <Users size={48} className="mb-2 opacity-20" />
                                        <p>No hay aprendices inscritos en este programa.</p>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
