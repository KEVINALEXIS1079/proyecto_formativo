import { useState, useEffect } from 'react';
import type { Cliente, CreateClienteDto } from '../models/types/sales.types';
import { useCreateCliente } from '../hooks/useSales';
import { Input, Button } from "@heroui/react";

interface ClientFormProps {
    cliente?: Cliente | null;
    onClose: () => void;
    onSuccess: () => void;
    readOnly?: boolean;
    onToggleEdit?: () => void;
    onCancel?: () => void;
}

export const ClientForm = ({ cliente, onClose, onSuccess, readOnly = false, onToggleEdit, onCancel }: ClientFormProps) => {
    const createMutation = useCreateCliente();

    const [formData, setFormData] = useState<CreateClienteDto>({
        nombre: '',
        identificacion: '',
        telefono: '',
        correo: '',
    });

    useEffect(() => {
        if (cliente) {
            setFormData({
                nombre: cliente.nombre,
                identificacion: cliente.identificacion || '',
                telefono: cliente.telefono || '',
                correo: cliente.correo || '',
            });
        }
    }, [cliente]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (cliente) {
                // await updateMutation.mutateAsync({ id: cliente.id, data: formData });
                console.log('Update not implemented yet');
            } else {
                await createMutation.mutateAsync(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving cliente:', error);
        }
    };

    const isLoading = createMutation.isPending;

    const handleCancel = () => {
        if (onCancel) onCancel();
        else onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Input
                        label="Nombre Completo"
                        placeholder="Ej: Juan Pérez"
                        value={formData.nombre}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, nombre: v }))}
                        isRequired
                        isDisabled={readOnly}
                    />
                </div>

                <Input
                    label="Identificación"
                    placeholder="CC / NIT"
                    value={formData.identificacion}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, identificacion: v }))}
                    isDisabled={readOnly}
                />

                <Input
                    label="Teléfono"
                    value={formData.telefono}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, telefono: v }))}
                    isDisabled={readOnly}
                />

                <div className="md:col-span-2">
                    <Input
                        type="email"
                        label="Correo Electrónico"
                        value={formData.correo}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, correo: v }))}
                        isDisabled={readOnly}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                {readOnly ? (
                    <>
                        <Button variant="light" onPress={handleCancel}>
                            Cerrar
                        </Button>
                        <Button color="success" className="font-medium text-black" onPress={onToggleEdit}>
                            Editar
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="flat" onPress={handleCancel}>
                            Cancelar
                        </Button>
                        <Button color="success" className="font-medium text-black" type="submit" isLoading={isLoading}>
                            {cliente ? "Guardar Cambios" : "Guardar"}
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
};
