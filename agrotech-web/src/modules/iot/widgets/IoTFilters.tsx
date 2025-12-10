import React from 'react';
import { Card, CardBody, Button, ScrollShadow, Input } from "@heroui/react";
import { MapPin, Layers, LayoutGrid, Play, Search } from 'lucide-react';

interface IoTFiltersProps {
    selectedLoteId: number | null;
    setSelectedLoteId: (id: number | null) => void;
    selectedSubLoteId: number | null;
    setSelectedSubLoteId: (id: number | null) => void;
    lotes: any[];
    subLotes: any[];
    isAutoMode?: boolean; // New prop to indicate if we are in auto-carousel mode
}

export const IoTFilters: React.FC<IoTFiltersProps> = ({
    selectedLoteId,
    setSelectedLoteId,
    selectedSubLoteId,
    setSelectedSubLoteId,
    lotes,
    subLotes,
    isAutoMode = false
}) => {
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredLotes = React.useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return lotes
            .filter(l => l.nombre.toLowerCase().includes(lowerTerm) || (l.ubicacion && l.ubicacion.toLowerCase().includes(lowerTerm)))
            .slice(0, 6); // Max 6 lots as requested
    }, [lotes, searchTerm]);

    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Lotes Disponibles 
                    <span className="text-xs font-normal text-gray-400 ml-2">({filteredLotes.length} visibles)</span>
                </h3>
                
                <div className="flex items-center gap-2">
                    <Input
                        classNames={{
                            base: "max-w-full sm:max-w-[15rem] h-10",
                            mainWrapper: "h-full",
                            input: "text-small",
                            inputWrapper: "h-full font-normal text-default-500 bg-white dark:bg-default-500/20",
                        }}
                        placeholder="Buscar lote..."
                        size="sm"
                        startContent={<Search size={18} />}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        isClearable
                        onClear={() => setSearchTerm("")}
                    />
                    
                    {isAutoMode && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold animate-pulse whitespace-nowrap">
                        <Play className="w-3 h-3 fill-current" />
                        AUTO
                    </div>
                    )}
                </div>
            </div>

            <ScrollShadow orientation="horizontal" className="pb-2 w-full">
                <div className="flex gap-4 min-w-full px-1">
                    {/* "All / Auto" Option (Acts as Deselect) */}
                    <div 
                        className={`flex-shrink-0 cursor-pointer transition-all duration-300 group ${!selectedLoteId ? 'scale-105' : 'hover:scale-102 opacity-70 hover:opacity-100'}`}
                        onClick={() => setSelectedLoteId(null)}
                    >
                        <Card className={`w-[160px] h-[100px] border-2 ${!selectedLoteId ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-dashed border-gray-300 bg-transparent hover:border-gray-400'}`}>
                            <CardBody className="flex flex-col items-center justify-center p-0 gap-2 overflow-hidden">
                                <LayoutGrid className={`w-8 h-8 ${!selectedLoteId ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <div className="text-center">
                                    <p className={`text-sm font-bold ${!selectedLoteId ? 'text-emerald-700' : 'text-gray-500'}`}>Vista General</p>
                                    <p className="text-[10px] text-gray-400">Rotación Automática</p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {filteredLotes.map((lote) => (
                        <div 
                            key={lote.id}
                            className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${selectedLoteId === lote.id ? 'scale-105' : 'hover:scale-102'}`}
                            onClick={() => setSelectedLoteId(lote.id)}
                        >
                            <Card className={`w-[200px] h-[100px] border-2 shadow-sm ${selectedLoteId === lote.id ? 'border-blue-500 bg-white' : 'border-transparent bg-white hover:border-blue-200'}`}>
                                <CardBody className="flex flex-row items-center gap-4 p-4 overflow-hidden">
                                    <div className={`p-3 rounded-full ${selectedLoteId === lote.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <p className={`font-bold truncate ${selectedLoteId === lote.id ? 'text-gray-900' : 'text-gray-600'}`}>{lote.nombre}</p>
                                        <p className="text-xs text-gray-400">{lote.ubicacion || 'Sin ubicación'}</p>
                                    </div>
                                </CardBody>
                                {isAutoMode && selectedLoteId === lote.id && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                    </div>
                                )}
                            </Card>
                        </div>
                    ))}
                </div>
            </ScrollShadow>

            {/* Sublotes - Only visible if a lote is selected and has sublotes */}
            {selectedLoteId && subLotes.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                        <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-500 mr-2 flex-shrink-0">Sublotes:</span>
                        <Button
                            size="sm"
                            variant={!selectedSubLoteId ? "solid" : "light"}
                            className={!selectedSubLoteId ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-900"}
                            onClick={() => setSelectedSubLoteId(null)}
                        >
                            Todos
                        </Button>
                        {subLotes.map((sub: any) => (
                            <Button
                                key={sub.id}
                                size="sm"
                                variant={selectedSubLoteId === sub.id ? "solid" : "light"}
                                color={selectedSubLoteId === sub.id ? "primary" : "default"}
                                className={selectedSubLoteId === sub.id ? "shadow-md" : "text-gray-500 hover:text-gray-900"}
                                onClick={() => setSelectedSubLoteId(sub.id)}
                            >
                                {sub.nombre}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
