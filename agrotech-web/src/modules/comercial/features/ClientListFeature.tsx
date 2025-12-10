import { useState, forwardRef, useImperativeHandle } from 'react';
import { useClientes } from '../hooks/useSales';
import { ClientTable } from '../widgets/ClientTable';
import { ClientForm } from '../widgets/ClientForm';
import { Modal } from '@/shared/components/ui/Modal';
import type { Cliente } from '../models/types/sales.types';

export interface ClientListRef {
    openCreateModal: () => void;
}

export const ClientListFeature = forwardRef<ClientListRef>((_, ref) => {
    const { data: clientes = [], isLoading } = useClientes();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useImperativeHandle(ref, () => ({
        openCreateModal: () => {
            setSelectedClient(null);
            setIsEditMode(true);
            setIsModalOpen(true);
        },
    }));

    const handleManage = (cliente: Cliente) => {
        setSelectedClient(cliente);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col">
            <ClientTable
                clientes={clientes}
                isLoading={isLoading}
                onEdit={handleManage}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedClient(null);
                    setIsEditMode(false);
                }}
                title={selectedClient
                    ? (isEditMode ? `Editar Cliente: ${selectedClient.nombre}` : `Gestionar Cliente: ${selectedClient.nombre}`)
                    : 'Nuevo Cliente'}
                size="lg"
            >
                <ClientForm
                    cliente={selectedClient}
                    readOnly={!isEditMode && !!selectedClient}
                    onToggleEdit={() => setIsEditMode(true)}
                    onCancel={() => {
                        if (isEditMode && selectedClient) {
                            setIsEditMode(false);
                        } else {
                            setIsModalOpen(false);
                            setSelectedClient(null);
                        }
                    }}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
});

ClientListFeature.displayName = 'ClientListFeature';
