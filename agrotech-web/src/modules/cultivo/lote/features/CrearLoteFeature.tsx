import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks } from "lucide-react";
import type { CreateLoteDTO } from "../model/types";
import { useLoteList } from "../hooks/useLoteList";
import { useCreateLote } from "../hooks/useCreateLote";
import LoteForm from "../ui/LoteForm";
import LoteMap from "../widgets/LoteMap";

export default function CrearLoteFeature() {
  const navigate = useNavigate();

  // Hooks de lotes
  const { lotes } = useLoteList();
  const { createLote, loading: creating } = useCreateLote();

  // Estados locales
  const [nombreLote, setNombreLote] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [mapMensaje, setMapMensaje] = useState("");
  const [coordenadas, setCoordenadas] = useState<{ latitud: number; longitud: number }[]>([]);
  const [area, setArea] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Manejo de envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreLote.trim()) {
      setErrorNombre("El nombre del lote es obligatorio.");
      return;
    }
    if (lotes.some((l) => l.nombre_lote === nombreLote.trim())) {
      setErrorNombre("El nombre del lote ya existe.");
      return;
    }
    setErrorNombre("");

    if (coordenadas.length < 3) {
      setMapMensaje("Debes seleccionar al menos 3 puntos en el mapa.");
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setMapMensaje("");

    try {
      const payload: CreateLoteDTO = {
        nombre_lote: nombreLote.trim(),
        coordenadas_lote: coordenadas.map((c) => ({
          latitud_lote: c.latitud,
          longitud_lote: c.longitud,
        })),
        area_lote: area,
      };

      await createLote(payload);
      navigate("/lotes/listar");
    } catch {
      setMapMensaje("No se pudo crear el lote.");
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-y-scroll h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <ListChecks className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Registrar Lote</h2>
      </div>

      {/* Mapa */}
      <div className="mb-6" ref={mapContainerRef}>
        <LoteMap
          coordenadas={coordenadas}
          setCoordenadas={setCoordenadas}
          setArea={setArea}
          lotesExistentes={lotes.map((l) => ({
            nombre: l.nombre_lote || `Lote ${l.id_lote_pk}`,
            coordenadas: l.coordenadas_lote.map((c) => ({
              latitud: c.latitud_lote,
              longitud: c.longitud_lote,
            })),
          }))}
          mensaje={mapMensaje}
          clearMensaje={() => setMapMensaje("")}
        />
      </div>

      {/* Formulario */}
      <LoteForm
        nombreLote={nombreLote}
        setNombreLote={(v) => {
          setNombreLote(v);
          if (errorNombre) setErrorNombre("");
        }}
        area={area}
        coordenadas={coordenadas}
        removeCoord={(i) => setCoordenadas(coordenadas.filter((_, idx) => idx !== i))}
        errorNombre={errorNombre}
        isLoading={creating}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/lotes/listar")}
      />
    </div>
  );
}
