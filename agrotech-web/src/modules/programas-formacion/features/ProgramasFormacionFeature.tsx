import { useState, forwardRef, useImperativeHandle } from 'react';
import toast from 'react-hot-toast';
import ProgramasFormacionList from '../components/ProgramasFormacionList';
import ProgramaFormacionModal from '../components/ProgramaFormacionModal';
import {
    useCreateProgramaFormacion,
    useUpdateProgramaFormacion,
    useDeleteProgramaFormacion,
} from '../hooks/useProgramasFormacion';
import type { ProgramaFormacion, CreateProgramaFormacionDto } from '../api/programas-formacion.api';

const ProgramasFormacionFeature = forwardRef<{ openCreateModal: () => void }>((props, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPrograma, setSelectedPrograma] = useState<ProgramaFormacion | null>(null);

    const createMutation = useCreateProgramaFormacion();
    const updateMutation = useUpdateProgramaFormacion();
    const deleteMutation = useDeleteProgramaFormacion();

    const handleCreate = () => {
        setSelectedPrograma(null);
        setIsModalOpen(true);
    };

    useImperativeHandle(ref, () => ({
        openCreateModal: handleCreate,
    }));

    const handleEdit = (programa: ProgramaFormacion) => {
        setSelectedPrograma(programa);
        setIsModalOpen(true);
    };

    const handleDelete = async (programa: ProgramaFormacion) => {
        if (!confirm(`¿Estás seguro de eliminar el programa ${programa.numeroFicha}?`)) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(programa.id);
            toast.success('Programa eliminado exitosamente');
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar el programa');
        }
    };

    const handleSubmit = async (data: CreateProgramaFormacionDto) => {
        try {
            if (selectedPrograma) {
                await updateMutation.mutateAsync({
                    id: selectedPrograma.id,
                    dto: data,
                });
                toast.success('Programa actualizado exitosamente');
            } else {
                await createMutation.mutateAsync(data);
                toast.success('Programa creado exitosamente');
            }
            setIsModalOpen(false);
            setSelectedPrograma(null);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar el programa');
        }
    };

    return (
        <>
            <ProgramasFormacionList
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ProgramaFormacionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPrograma(null);
                }}
                onSubmit={handleSubmit}
                programa={selectedPrograma}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </>
    );
});

ProgramasFormacionFeature.displayName = 'ProgramasFormacionFeature';

export default ProgramasFormacionFeature;
