import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from "@heroui/react";
import { useState, useEffect } from "react";
import { LoteMap } from "../../cultivos/widgets";
import { useCreateLote, useUpdateLote } from "../../cultivos/hooks/useLotes";
import type { CreateLoteDTO, Lote } from "../../cultivos/model/types";
import { useGeoData } from "../hooks/useGeoData";
import { Trash2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loteToEdit?: Lote;
}

export default function LoteModal({ isOpen, onClose, loteToEdit }: Props) {
  // Renamed to avoid confusion with existing hook usage convention
  const { data: lotes = [], refetch } = useGeoData();

  /* Hook usage explanation: 
     Hooks return { mutate, loading, error }, but we aliased them to createLote/updateLote in previous steps.
     We must ensure we are using the MUTATE function from the hook, not the service directly, to get proper loading state.
  */
  const { createLote, loading: creating } = useCreateLote();
  const { updateLote, loading: updating } = useUpdateLote();

  // Fix state initialization types
  const [nombre, setNombre] = useState<string>("");
  const [coordenadas, setCoordenadas] = useState<{ latitud_lote: number; longitud_lote: number }[]>([]);
  const [area, setArea] = useState<number>(0);
  const [errorNombre, setErrorNombre] = useState<string>("");
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (loteToEdit) {
        setNombre(loteToEdit.nombre_lote || "");
        setArea(loteToEdit.area_lote || 0);
        setCoordenadas(loteToEdit.coordenadas_lote || []);
        setIsReadOnly(true);
      } else {
        setNombre("");
        setArea(0);
        setCoordenadas([]);
        setIsReadOnly(false);
      }
      setErrorNombre("");
    }
  }, [isOpen, loteToEdit]);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setErrorNombre("El nombre es requerido");
      return;
    }
    if (coordenadas.length < 3) {
      alert("Debes dibujar un polígono válido (mínimo 3 puntos)");
      return;
    }
    // No "area" check needed for payload, backend likely calculates it or we trust coords

    try {
      // Create GeoJSON Polygon
      // coordinates array of array of numbers [[lng, lat], [lng, lat], ...]
      const polygonCoords = coordinatesToGeoJSON(coordenadas);

      const payload: CreateLoteDTO = {
        nombre: nombre.trim(),
        geom: {
          type: "Polygon",
          coordinates: [polygonCoords]
        },
        // descripcion: "" // Add if field exists in UI
      };

      if (loteToEdit) {
        await updateLote(loteToEdit.id_lote_pk!, payload);
      } else {
        await createLote(payload);
      }
      refetch();
      onClose();
    } catch (error: any) {
      console.error("Error saving lote:", error);
      if (error.response?.data) {
        const errorMsg = error.response.data.message || "Error al guardar";
        alert(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
      } else {
        alert("Error al guardar el lote");
      }
    }
  };

  const coordinatesToGeoJSON = (coords: { latitud_lote: number; longitud_lote: number }[]) => {
    // Map to [lng, lat]
    const points = coords.map(c => [Number(c.longitud_lote), Number(c.latitud_lote)]);
    // Close the loop if not closed
    const first = points[0];
    const last = points[points.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      points.push(first);
    }
    return points;
  };

  const isLoading = creating || updating;

  return (
    <Modal size="3xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside" classNames={{ base: "max-w-[60vw]" }}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {loteToEdit ? (isReadOnly ? "Detalles del Lote" : "Editar Lote") : "Nuevo Lote"}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column: Form & Coordinates */}
            <div className="col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-2">
              <Input
                label="Nombre del Lote"
                placeholder="Ej: Lote Norte"
                value={nombre}
                onValueChange={(v) => {
                  setNombre(v);
                  if (errorNombre) setErrorNombre("");
                }}
                variant="bordered"
                isDisabled={isReadOnly}
                isInvalid={!!errorNombre}
                errorMessage={errorNombre}
              />

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

              <div className="flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Coordenadas ({coordenadas.length})</span>
                  {!isReadOnly && (
                    <Button size="sm" variant="flat" color="danger" onPress={() => setCoordenadas([])}>
                      Limpiar
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
                  {coordenadas.map((c, i) => (
                    <div key={i} className="flex flex-col gap-2 p-2 bg-gray-50 dark:bg-zinc-900 rounded text-xs border border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-500">Punto {i + 1}</span>
                        {!isReadOnly && (
                          <button
                            onClick={() => {
                              const newCoords = [...coordenadas];
                              newCoords.splice(i, 1);
                              setCoordenadas(newCoords);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          size="sm"
                          label="Lat"
                          value={c.latitud_lote?.toString() ?? ""}
                          isDisabled={isReadOnly}
                          onValueChange={(val) => {
                            const newCoords = [...coordenadas];
                            newCoords[i] = { ...newCoords[i], latitud_lote: parseFloat(val) };
                            setCoordenadas(newCoords);
                          }}
                        />
                        <Input
                          size="sm"
                          label="Lng"
                          value={c.longitud_lote?.toString() ?? ""}
                          isDisabled={isReadOnly}
                          onValueChange={(val) => {
                            const newCoords = [...coordenadas];
                            newCoords[i] = { ...newCoords[i], longitud_lote: parseFloat(val) };
                            setCoordenadas(newCoords);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {coordenadas.length === 0 && (
                    <p className="text-gray-400 text-sm italic text-center py-4">
                      {isReadOnly ? "No hay coordenadas registradas" : "Haz clic en el mapa para agregar puntos"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Map */}
            <div className="col-span-8 h-full min-h-[400px] bg-gray-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 relative">
              <LoteMap
                coordenadas={coordenadas}
                setCoordenadas={setCoordenadas}
                setArea={setArea}
                isEditing={!isReadOnly}
                lotesExistentes={lotes}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
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
                if (loteToEdit) {
                  setIsReadOnly(true);
                  // Optionally reset form values here if needed
                } else {
                  onClose();
                }
              }}>
                Cancelar
              </Button>
              <Button className="font-medium text-black" color="success" onPress={handleSubmit} isLoading={isLoading}>
                {loteToEdit ? "Guardar Cambios" : "Guardar"}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
