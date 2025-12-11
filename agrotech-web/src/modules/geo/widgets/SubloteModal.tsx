import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Select, SelectItem } from "@heroui/react";
import { useState, useRef, useEffect } from "react";
import { SubloteMap } from "../../cultivos/widgets";
import { useCreateSublote, useUpdateSublote, useLotesList } from "../../cultivos/hooks/useLotes";
import type { Sublote } from "../../cultivos/model/types";
import { useGeoData } from "../hooks/useGeoData";
import { Trash2, Info } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    subloteToEdit?: Sublote;
}

// Imports
import { validateSublote } from "../utils/spatial-validation";
import MapValidationAlert from "../components/MapValidationAlert";

export default function SubloteModal({ isOpen, onClose, subloteToEdit }: Props) {
    // ... hooks
    const { refetch } = useGeoData();
    const { data: lotes = [] } = useLotesList();
    const { createSublote, loading: creating } = useCreateSublote();
    const { updateSublote, loading: updating } = useUpdateSublote();

    // Local state
    const [nombreSublote, setNombreSublote] = useState("");
    const [loteSeleccionado, setLoteSeleccionado] = useState<string>("");
    const [errorNombre, setErrorNombre] = useState("");
    const [coordenadas, setCoordenadas] = useState<{ latitud_sublote: number; longitud_sublote: number }[]>([]);
    const [area, setArea] = useState(0);
    const [isReadOnly, setIsReadOnly] = useState(false);
    // NEW: Validation state
    const [validationError, setValidationError] = useState<string | null>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Initialize form when opening for edit
    useEffect(() => {
        if (isOpen) {
            setValidationError(null); // Reset
            if (subloteToEdit) {
                setNombreSublote(subloteToEdit.nombre_sublote || "");
                setLoteSeleccionado(String(subloteToEdit.id_lote_fk || subloteToEdit.idLote || ""));
                setCoordenadas(subloteToEdit.coordenadas_sublote || []);
                setArea(subloteToEdit.area_sublote || 0);
                setIsReadOnly(true);
            } else {
                // Reset for create
                setNombreSublote("");
                setLoteSeleccionado("");
                setCoordenadas([]);
                setArea(0);
                setIsReadOnly(false);
            }
            setErrorNombre("");
        }
    }, [isOpen, subloteToEdit]);

    const handleSubmit = async () => {
        if (!nombreSublote.trim()) {
            setErrorNombre("El nombre del sublote es obligatorio.");
            return;
        }
        setErrorNombre("");

        if (!loteSeleccionado) {
            alert("Debes seleccionar un lote.");
            return;
        }

        // SPATIAL VALIDATION
        const parentLote = lotes.find(l => String(l.id_lote_pk) === loteSeleccionado);
        // We need existing sublotes for this parent. 
        // NOTE: The `lotes` array from `useLotesList` typically includes `sublotes` nested property.
        // If not, we might need to fetch them. Assuming they are present as `useLotesList` implies full hierarchy primarily.
        const existingSublotes = parentLote?.sublotes || [];

        const validation = validateSublote(coordenadas, parentLote, existingSublotes, subloteToEdit?.id_sublote_pk);
        if (!validation.isValid) {
            setValidationError(validation.message || "Error de validación espacial");
            return;
        }

        if (coordenadas.length < 3) {
            setValidationError("Debes dibujar un polígono válido (mínimo 3 puntos).");
            return;
        }
        if (area <= 0) {
            setValidationError("El área debe ser mayor a 0");
            return;
        }

        try {
            // Prepare GeoJSON Polygon
            const points = coordenadas.map(c => [c.longitud_sublote, c.latitud_sublote]);
            if (points.length > 0) {
                const first = points[0];
                const last = points[points.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    points.push(first);
                }
            }

            const geojson = {
                type: "Polygon",
                coordinates: [points]
            };

            // Payload MUST match CreateSubLoteDto: { loteId, nombre, geom }
            const payload: any = {
                nombre: nombreSublote.trim(), // Backend: 'nombre'
                // area_sublote: area, // Backend does not listed area? It likely calculates it or stores it in geom properties?
                // Let's keep compatible fields just in case, but prioritize DTO keys
                loteId: loteSeleccionado ? Number(loteSeleccionado) : null, // Backend: 'loteId'
                geom: geojson, // Backend: 'geom'
                descripcion: "", // Optional

                // Keeping these ONLY if mapper downstream needs them, but purely for DTO compliance:
                // nombre_sublote: nombreSublote.trim(),
                // id_lote: loteSeleccionado ? Number(loteSeleccionado) : null,
                // geometria: geojson 
            };

            // Note: If update uses proper DTO, it probably uses UpdateSubLoteDto which usually matches Create.
            // But verify if Update maps differently. Assuming standard CRUD.

            console.log("Sending Sublote Payload (DTO compliant):", payload);

            if (subloteToEdit) {
                await updateSublote(subloteToEdit.id_sublote_pk!, payload);
            } else {
                await createSublote(payload);
            }

            refetch();
            onClose();
        } catch (error: any) {
            console.error("Error saving sublote:", error);

            // Extract detailed message
            let serverMsg = "";
            if (error.response?.data) {
                const d = error.response.data;
                serverMsg = d.message || d.error || JSON.stringify(d);
                if (Array.isArray(serverMsg)) serverMsg = serverMsg.join("\n");
            } else {
                serverMsg = error.message || String(error);
            }

            alert(`Error al guardar: ${serverMsg}`);
        }
    };

    const isLoading = creating || updating;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
            backdrop="blur"
            classNames={{
                base: "h-[80vh] max-w-[60vw]",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-2xl font-bold">
                            {subloteToEdit ? (isReadOnly ? "Detalles del Sublote" : "Editar Sublote") : "Registrar Nuevo Sublote"}
                        </ModalHeader>
                        <ModalBody className="p-0 overflow-hidden">
                            {/* ... Instructions ... */}
                            <div className="bg-success-50 dark:bg-success-900/20 p-4 border-b border-success-100 dark:border-success-900/50 flex gap-3 items-start">
                                <Info className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-success-800 dark:text-success-200">
                                    <p className="font-semibold mb-1">Instrucciones</p>
                                    <p>
                                        Primero <strong>selecciona un lote principal</strong>. Luego, dibuja el sublote haciendo clic dentro de los límites del lote seleccionado. Asegúrate de cerrar el polígono uniendo el último punto con el primero.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Left Column: Parameters */}
                                <div className="w-full lg:w-5/12 p-6 overflow-y-auto border-r border-divider space-y-6 bg-content1/50">
                                    {/* ... Inputs ... */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Información General</h3>
                                        <div className="space-y-4">
                                            <Input
                                                label="Nombre del sublote"
                                                placeholder="Ej. Sublote A1"
                                                value={nombreSublote}
                                                onValueChange={(v) => {
                                                    setNombreSublote(v);
                                                    if (errorNombre) setErrorNombre("");
                                                }}
                                                isRequired
                                                isInvalid={!!errorNombre}
                                                errorMessage={errorNombre}
                                                variant="bordered"
                                                isDisabled={isReadOnly}
                                            />

                                            <Select
                                                label="Lote asociado"
                                                placeholder="Selecciona un lote"
                                                selectedKeys={loteSeleccionado ? [loteSeleccionado] : []}
                                                onSelectionChange={(keys) => setLoteSeleccionado(Array.from(keys)[0] as string)}
                                                variant="bordered"
                                                isRequired
                                                isDisabled={isReadOnly}
                                            >
                                                {lotes.map((lote) => (
                                                    <SelectItem key={String(lote.id_lote_pk)}>
                                                        {lote.nombre_lote}
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <span className="text-xs font-semibold text-gray-500 uppercase">Área Calculada</span>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                        {Math.round(area).toLocaleString('es-CO')}
                                                    </span>
                                                    <span className="text-sm text-gray-500 mb-1">m²</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {(area / 10000).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">Coordenadas</h3>
                                            {!isReadOnly && (
                                                <Button size="sm" variant="flat" color="danger" onPress={() => setCoordenadas([])}>
                                                    Limpiar
                                                </Button>
                                            )}
                                        </div>
                                        {coordenadas.length === 0 ? (
                                            <div className="p-4 rounded-lg bg-default-100 text-default-500 text-sm text-center">
                                                {isReadOnly ? "No hay coordenadas registradas" : "Dibuja un polígono en el mapa para ver las coordenadas."}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                                {coordenadas.map((c, i) => (
                                                    <div key={i} className="flex flex-col gap-2 p-3 rounded-lg border border-divider bg-background">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-primary text-xs">Punto {i + 1}</span>
                                                            {!isReadOnly && (
                                                                <Button
                                                                    size="sm"
                                                                    color="danger"
                                                                    variant="light"
                                                                    isIconOnly
                                                                    className="h-6 w-6 min-w-0"
                                                                    onPress={() => setCoordenadas(coordenadas.filter((_, idx) => idx !== i))}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                label="Latitud"
                                                                size="sm"
                                                                type="number"
                                                                variant="bordered"
                                                                value={c.latitud_sublote.toString()}
                                                                isDisabled={isReadOnly}
                                                                onValueChange={(val) => {
                                                                    const newCoords = [...coordenadas];
                                                                    newCoords[i].latitud_sublote = parseFloat(val);
                                                                    setCoordenadas(newCoords);
                                                                }}
                                                            />
                                                            <Input
                                                                label="Longitud"
                                                                size="sm"
                                                                type="number"
                                                                variant="bordered"
                                                                value={c.longitud_sublote.toString()}
                                                                isDisabled={isReadOnly}
                                                                onValueChange={(val) => {
                                                                    const newCoords = [...coordenadas];
                                                                    newCoords[i].longitud_sublote = parseFloat(val);
                                                                    setCoordenadas(newCoords);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Map */}
                                <div className="w-full lg:w-7/12 h-[400px] lg:h-auto relative bg-gray-50 dark:bg-zinc-900" ref={mapContainerRef}>
                                    {/* VALIDATION ALERT OVERLAY */}
                                    <MapValidationAlert
                                        message={validationError}
                                        onClose={() => setValidationError(null)}
                                    />
                                    <div className="absolute inset-0 p-4">
                                        <SubloteMap
                                            coordenadas={coordenadas}
                                            setCoordenadas={setCoordenadas}
                                            setArea={setArea}
                                            loteSeleccionado={loteSeleccionado}
                                            lotes={lotes}
                                            isEditing={!isReadOnly}
                                            onError={(msg) => setValidationError(msg)}
                                            editingId={subloteToEdit?.id_sublote_pk}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-divider">
                            {isReadOnly ? (
                                <>
                                    <Button variant="light" onPress={onClose}>
                                        Cerrar
                                    </Button>
                                    <Button color="success" className="font-medium text-black" onPress={() => setIsReadOnly(false)}>
                                        Editar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="flat" onPress={() => {
                                        if (subloteToEdit) {
                                            setIsReadOnly(true);
                                        } else {
                                            onClose();
                                        }
                                    }}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        color="success"
                                        onPress={handleSubmit}
                                        isLoading={isLoading}
                                        className="font-medium text-black"
                                    >
                                        {isLoading ? "Guardando..." : (subloteToEdit ? "Guardar Cambios" : "Guardar")}
                                    </Button>
                                </>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
