import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Textarea,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInsumo } from "../api/insumos.service";
import { toast } from "react-hot-toast";
import { AlertTriangle } from "lucide-react";

interface DarBajaModalProps {
    isOpen: boolean;
    onClose: () => void;
    activoFijoId: number | null;
    nombreActivo?: string;
}

interface DarBajaForm {
    razon: string;
}

export const DarBajaModal: React.FC<DarBajaModalProps> = ({
    isOpen,
    onClose,
    activoFijoId,
    nombreActivo,
}) => {
    const { register, handleSubmit, reset } = useForm<DarBajaForm>();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: DarBajaForm) => {
            if (!activoFijoId) throw new Error("No activo ID");
            return updateInsumo(activoFijoId, {
                estado: "DADO_DE_BAJA",
                fechaBaja: new Date(), // This might need ISO string handling depending on backend, passing Date usually works with axios/JSON.
                descripcionOperacion: data.razon,
                // We technically send CreateInsumoInput-like partial. 
                // Need to ensure updateInsumo handles these fields. 
                // Our service mapUpdateDtoToApi handles payload mapping.
                // We need to check execution.
            } as any);
        },
        onSuccess: () => {
            toast.success("Activo dado de baja correctamente");
            queryClient.invalidateQueries({ queryKey: ["activos-fijos"] });
            reset();
            onClose();
        },
        onError: () => {
            toast.error("Error al dar de baja el activo");
        },
    });

    const onSubmit = (data: DarBajaForm) => {
        mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader className="flex gap-2 items-center text-danger">
                    <AlertTriangle size={24} />
                    Dar de Baja - {nombreActivo}
                </ModalHeader>
                <ModalBody>
                    <p className="text-sm text-default-500">
                        ¿Está seguro que desea dar de baja este activo? Esta acción cambiará su estado permanentemente.
                    </p>
                    <form id="baja-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Textarea
                            label="Razón de la baja"
                            placeholder="Explique por qué se da de baja..."
                            {...register("razon", { required: "La razón es requerida" })}
                        />
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button color="danger" type="submit" form="baja-form" isLoading={isPending}>
                        Confirmar Baja
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
