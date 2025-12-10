import { useState, forwardRef, useImperativeHandle } from 'react';
import { useLotesProduccion } from '../hooks/useProduction';
import { LoteTable } from '../widgets/LoteTable';
import { LoteForm } from '../widgets/LoteForm';
import { Modal } from '@/shared/components/ui/Modal';
import type { LoteProduccion } from '../models/types/production.types';

export interface LoteListRef {
    openCreateModal: () => void;
}

export const LoteListFeature = forwardRef<LoteListRef>((_, ref) => {
    const { data: lotes = [], isLoading } = useLotesProduccion();

    const [searchTerm, setSearchTerm] = useState('');
    const [qualityFilter, setQualityFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState<LoteProduccion | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useImperativeHandle(ref, () => ({
        openCreateModal: () => {
            setSelectedLote(null);
            setIsEditMode(true);
            setIsModalOpen(true);
        },
    }));

    const handleManage = (lote: LoteProduccion) => {
        setSelectedLote(lote);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const filteredLotes = lotes.filter(l => {
        const matchSearch = (l.productoAgro?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(l.cultivoId || '').includes(searchTerm);
        const matchQuality = qualityFilter === 'all' || l.calidad === qualityFilter;
        return matchSearch && matchQuality;
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 mb-2">
                <input
                    type="text"
                    placeholder="Buscar por producto o cultivo..."
                    className="px-4 py-2 border rounded-lg flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="px-4 py-2 border rounded-lg"
                    value={qualityFilter}
                    onChange={(e) => setQualityFilter(e.target.value)}
                >
                    <option value="all">Todas las Calidades</option>
                    <option value="Primera">Primera</option>
                    <option value="Segunda">Segunda</option>
                    <option value="Tercera">Tercera</option>
                </select>
            </div>

            <LoteTable
                lotes={filteredLotes}
                isLoading={isLoading}
                onEdit={handleManage}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLote(null);
                    setIsEditMode(false);
                }}
                title={selectedLote
                    ? (isEditMode ? `Editar Lote: #${selectedLote.id}` : `Gestionar Lote: #${selectedLote.id}`)
                    : 'Nuevo Lote de Producción'}
                size="2xl"
            >
                <LoteForm
                    lote={selectedLote}
                    readOnly={!isEditMode && !!selectedLote}
                    onToggleEdit={() => setIsEditMode(true)}
                    onCancel={() => {
                        if (isEditMode && selectedLote) {
                            setIsEditMode(false);
                        } else {
                            setIsModalOpen(false);
                            setSelectedLote(null);
                        }
                    }}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
});

LoteListFeature.displayName = 'LoteListFeature';
