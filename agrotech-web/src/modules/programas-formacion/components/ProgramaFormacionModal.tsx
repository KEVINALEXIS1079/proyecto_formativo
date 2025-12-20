import { useEffect } from 'react';
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
    Textarea,
} from '@heroui/react';
import { useForm, Controller } from 'react-hook-form';
import { useTiposFormacion } from '../hooks/useTiposFormacion';
import type { ProgramaFormacion, CreateProgramaFormacionDto } from '../api/programas-formacion.api';

interface ProgramaFormacionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProgramaFormacionDto) => void;
    programa?: ProgramaFormacion | null;
    isLoading?: boolean;
}

export default function ProgramaFormacionModal({
    isOpen,
    onClose,
    onSubmit,
    programa,
    isLoading,
}: ProgramaFormacionModalProps) {
    const { data: tipos } = useTiposFormacion();
    const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateProgramaFormacionDto>({
        defaultValues: {
            numeroFicha: '',
            nombre: '',
            tipo: '',
            descripcion: '',
            fechaInicio: '',
            fechaFin: '',
            estado: 'ACTIVO',
        },
    });

    useEffect(() => {
        if (programa) {
            reset({
                numeroFicha: programa.numeroFicha,
                nombre: programa.nombre,
                tipo: programa.tipo,
                descripcion: programa.descripcion || '',
                fechaInicio: programa.fechaInicio || '',
                fechaFin: programa.fechaFin || '',
                estado: programa.estado,
            });
        } else {
            reset({
                numeroFicha: '',
                nombre: '',
                tipo: '',
                descripcion: '',
                fechaInicio: '',
                fechaFin: '',
                estado: 'ACTIVO',
            });
        }
    }, [programa, reset, isOpen]);

    const handleFormSubmit = (data: CreateProgramaFormacionDto) => {
        onSubmit(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" placement="center">
            <ModalContent>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <ModalHeader>
                        {programa ? 'Editar' : 'Nuevo'} Programa de Formación
                    </ModalHeader>

                    <ModalBody>
                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="numeroFicha"
                                control={control}
                                rules={{ required: 'El número de ficha es requerido' }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Número de Ficha"
                                        placeholder="2925484"
                                        isRequired
                                        isInvalid={!!errors.numeroFicha}
                                        errorMessage={errors.numeroFicha?.message}
                                        description="Número único de la ficha SENA"
                                    />
                                )}
                            />

                            <Controller
                                name="tipo"
                                control={control}
                                rules={{ required: 'El tipo es requerido' }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label="Tipo de Formación"
                                        placeholder="Selecciona el tipo"
                                        isRequired
                                        isInvalid={!!errors.tipo}
                                        errorMessage={errors.tipo?.message}
                                        selectedKeys={field.value ? [field.value] : []}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            field.onChange(selected);
                                        }}
                                    >
                                        {tipos?.map((tipo) => (
                                            <SelectItem key={tipo.codigo}>
                                                {tipo.nombre}
                                            </SelectItem>
                                        )) || []}
                                    </Select>
                                )}
                            />

                            <Controller
                                name="nombre"
                                control={control}
                                rules={{ required: 'El nombre es requerido' }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Nombre del Programa"
                                        placeholder="Análisis y Desarrollo de Software"
                                        isRequired
                                        isInvalid={!!errors.nombre}
                                        errorMessage={errors.nombre?.message}
                                        className="col-span-2"
                                    />
                                )}
                            />

                            <Controller
                                name="descripcion"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        label="Descripción"
                                        placeholder="Descripción detallada del programa..."
                                        className="col-span-2"
                                    />
                                )}
                            />

                            <Controller
                                name="fechaInicio"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} type="date" label="Fecha de Inicio" />
                                )}
                            />

                            <Controller
                                name="fechaFin"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} type="date" label="Fecha de Finalización" />
                                )}
                            />

                            <Controller
                                name="estado"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label="Estado"
                                        selectedKeys={field.value ? [field.value] : []}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            field.onChange(selected);
                                        }}
                                    >
                                        <SelectItem key="ACTIVO">Activo</SelectItem>
                                        <SelectItem key="FINALIZADO">Finalizado</SelectItem>
                                        <SelectItem key="SUSPENDIDO">Suspendido</SelectItem>
                                    </Select>
                                )}
                            />
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Cancelar
                        </Button>
                        <Button color="success" type="submit" isLoading={isLoading}>
                            {programa ? 'Actualizar' : 'Crear'} Programa
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
