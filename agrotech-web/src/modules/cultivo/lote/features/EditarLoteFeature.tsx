import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks } from "lucide-react";
import LoteForm from "../ui/LoteForm";
import LoteMap from "../widgets/LoteMap";
import type { Coordenada, LoteExistente } from "../widgets/LoteMap";
import { useLoteList } from "../hooks/useLoteList";
import { useLoteById } from "../hooks/useLoteById";
import { useUpdateLote } from "../hooks/useUpdateLote";
import type { CreateLoteDTO } from "../model/types";

type Props = {
  loteId: number;
};

export default function EditarLoteFeature({ loteId }: Props) {
  const navigate = useNavigate();
  const { lotes } = useLoteList();
  const { lote, loading: loadingLote } = useLoteById(loteId);
  const { updateLote, loading: updating } = useUpdateLote();

  const [nombreLote, setNombreLote] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [coordenadas, setCoordenadas] = useState<Coordenada[]>([]);
  const [area, setArea] = useState(0);
  const [mensajeMapa, setMensajeMapa] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Lotes existentes excluyendo el actual
  const lotesExistentes: LoteExistente[] = useMemo(
    () =>
      lotes
        .filter((l) => l.id_lote_pk !== loteId)
        .map((l) => ({
          nombre: l.nombre_lote || `Lote ${l.id_lote_pk}`,
          coordenadas:
            l.coordenadas_lote?.map((c) => ({
              latitud: c.latitud_lote,
              longitud: c.longitud_lote,
            })) || [],
        })),
    [lotes, loteId]
  );

  // Cargar datos del lote
  useEffect(() => {
    if (!lote) return;
    setNombreLote(lote.nombre_lote || "");
    setCoordenadas(
      lote.coordenadas_lote?.map((c) => ({
        latitud: c.latitud_lote,
        longitud: c.longitud_lote,
      })) || []
    );
    setArea(lote.area_lote || 0);
  }, [lote]);

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreLote.trim()) {
      setErrorNombre("El nombre del lote es obligatorio.");
      return;
    }

    if (
      lotes.some(
        (l) =>
          l.nombre_lote === nombreLote.trim() && l.id_lote_pk !== loteId
      )
    ) {
      setErrorNombre("El nombre del lote ya existe.");
      return;
    }
    setErrorNombre("");

    if (coordenadas.length < 3) {
      setMensajeMapa("Debes colocar al menos 3 puntos en el mapa.");
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setMensajeMapa("");

    try {
      const payload: CreateLoteDTO = {
        nombre_lote: nombreLote.trim(),
        coordenadas_lote: coordenadas.map((c) => ({
          latitud_lote: c.latitud,
          longitud_lote: c.longitud,
        })),
        area_lote: area,
      };
      await updateLote(loteId, payload);
      navigate("/lotes/listar");
    } catch {
      setMensajeMapa("No se pudo actualizar el lote.");
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loadingLote) return <p>Cargando lote...</p>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-y-scroll h-[calc(100vh-10rem)] space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Editar Lote</h2>
      </div>

      {/* Mapa */}
      <div ref={mapContainerRef}>
        <LoteMap
          coordenadas={coordenadas}
          setCoordenadas={setCoordenadas}
          setArea={setArea}
          lotesExistentes={lotesExistentes}
          mensaje={mensajeMapa}
          clearMensaje={() => setMensajeMapa("")}
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
        isLoading={updating}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/lotes/listar")}
      />
    </div>
  );
}
