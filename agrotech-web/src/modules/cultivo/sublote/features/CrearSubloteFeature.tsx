import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks } from "lucide-react";
import type { Lote } from "../../lote/model/types";
import type { CreateSubloteDTO, Sublote } from "../model/types";
import { useSubloteList } from "../hooks/useSubloteList";
import { useCreateSublote } from "../hooks/useCreateSublote";
import { useLoteList } from "@/modules/cultivo/lote/hooks/useLoteList";
import SubloteForm from "../ui/SubloteForm";
import SubloteMap from "../widgets/SubloteMap";

export default function CrearSubloteFeature() {
  const navigate = useNavigate();
  const { sublotes } = useSubloteList();
  const { lotes } = useLoteList();
  const { createSublote, loading: creating } = useCreateSublote();

  const [nombreSublote, setNombreSublote] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [mapMensaje, setMapMensaje] = useState("");
  const [coordenadas, setCoordenadas] = useState<{ latitud_sublote: number; longitud_sublote: number }[]>([]);
  const [area, setArea] = useState(0);
  const [loteSeleccionado, setLoteSeleccionado] = useState<string>("");

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreSublote.trim()) {
      setErrorNombre("El nombre del sublote es obligatorio.");
      return;
    }
    if (sublotes.some((s) => s.nombre_sublote === nombreSublote.trim())) {
      setErrorNombre("El nombre del sublote ya existe.");
      return;
    }
    setErrorNombre("");

    if (!loteSeleccionado) {
      setMapMensaje("Debes seleccionar un lote al que pertenezca el sublote.");
      return;
    }

    if (coordenadas.length < 3) {
      setMapMensaje("Debes seleccionar al menos 3 puntos en el mapa.");
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setMapMensaje("");

    try {
      const payload: CreateSubloteDTO = {
        nombre_sublote: nombreSublote.trim(),
        coordenadas_sublote: coordenadas.map((c) => ({
          latitud_sublote: c.latitud_sublote,
          longitud_sublote: c.longitud_sublote,
        })),
        area_sublote: area,
        id_lote_fk: Number(loteSeleccionado),
      };

      await createSublote(payload);
      navigate("/sublotes/listar");
    } catch {
      setMapMensaje("No se pudo crear el sublote.");
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-y-scroll h-[calc(100vh-10rem)]">
      <div className="flex items-center gap-2 mb-8">
        <ListChecks className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Registrar Sublote</h2>
      </div>

      <div className="mb-6" ref={mapContainerRef}>
        <SubloteMap
          coordenadas={coordenadas}
          setCoordenadas={setCoordenadas}
          setArea={setArea}
          sublotesExistentes={
            sublotes.map((s): Sublote => ({
              id_sublote_pk: s.id_sublote_pk,
              nombre_sublote: s.nombre_sublote || `Sublote ${s.id_sublote_pk}`,
              area_sublote: s.area_sublote || 0,
              coordenadas_sublote: s.coordenadas_sublote,
              lote: s.lote || null,
              cultivos: s.cultivos || [],
              delete_at: s.delete_at || null,
            }))
          }
          lotes={
            lotes.map((l): Lote => ({
              id_lote_pk: l.id_lote_pk,
              nombre_lote: l.nombre_lote,
              area_lote: l.area_lote || 0,
              coordenadas_lote: l.coordenadas_lote,
              sublotes: l.sublotes || [],
              delete_at: l.delete_at || null,
            }))
          }
          loteSeleccionado={loteSeleccionado}
          setLoteSeleccionado={setLoteSeleccionado}
          mensaje={mapMensaje}
          clearMensaje={() => setMapMensaje("")}
        />
      </div>

      <SubloteForm
        nombreSublote={nombreSublote}
        setNombreSublote={(v) => {
          setNombreSublote(v);
          if (errorNombre) setErrorNombre("");
        }}
        loteSeleccionado={loteSeleccionado}
        setLoteSeleccionado={setLoteSeleccionado}
        lotes={lotes}
        area={area}
        coordenadas={coordenadas}
        removeCoord={(i) => setCoordenadas(coordenadas.filter((_, idx) => idx !== i))}
        errorNombre={errorNombre}
        isLoading={creating}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/sublotes/listar")}
      />
    </div>
  );
}
