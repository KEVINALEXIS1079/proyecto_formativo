import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarMantenimiento } from "../api/insumos.service";
import { toast } from "react-hot-toast";

interface MantenimientoModalProps {
    isOpen: boolean;
    onClose: () => void;
    activoFijoId: number | null;
    nombreActivo?: string;
}

interface MantenimientoForm {
    costo: number;
    descripcion: string;
}

export const MantenimientoActivoFijoModal: React.FC<MantenimientoModalProps> = ({
    isOpen,
    onClose,
    activoFijoId,
    nombreActivo,
}) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<MantenimientoForm>();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: MantenimientoForm) => {
            if (!activoFijoId) throw new Error("No activo ID");
            return registrarMantenimiento(activoFijoId, data);
        },
        onSuccess: () => {
            toast.success("Mantenimiento registrado correctamente");
            queryClient.invalidateQueries({ queryKey: ["activos-fijos"] });
            reset();
            onClose();
        },
        onError: () => {
            toast.error("Error al registrar mantenimiento");
        },
    });

    const onSubmit = (data: MantenimientoForm) => {
        mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>Registrar Mantenimiento - {nombreActivo}</ModalHeader>
                <ModalBody>
                    <form id="mantenimiento-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Costo Estimado"
                            type="number"
                            step="0.01"
                            {...register("costo", { valueAsNumber: true, min: 0 })}
                            errorMessage={errors.costo?.message}
                        />
                        <Textarea
                            label="Descripción del trabajo"
                            placeholder="Detalles del mantenimiento..."
                            {...register("descripcion", { required: "La descripción es requerida" })}
                            errorMessage={errors.descripcion?.message}
                        />
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button color="primary" type="submit" form="mantenimiento-form" isLoading={isPending}>
                        Registrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
