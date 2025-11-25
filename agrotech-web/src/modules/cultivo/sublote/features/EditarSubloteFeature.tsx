import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks } from "lucide-react";
import type { CreateSubloteDTO } from "../model/types";
import { useSubloteList } from "../hooks/useSubloteList";
import { useSubloteById } from "../hooks/useSubloteById";
import { useUpdateSublote } from "../hooks/useUpdateSublote";
import { useLoteList } from "../../lote/hooks/useLoteList";
import SubloteForm from "../ui/SubloteForm";
import SubloteMap, { type CoordenadaSublote } from "../widgets/SubloteMap";

interface Props {
  subloteId: number;
}

export default function EditarSubloteFeature({ subloteId }: Props) {
  const navigate = useNavigate();

  const { sublotes } = useSubloteList();
  const { sublote, loading: loadingSublote } = useSubloteById(subloteId);
  const { updateSublote, loading: updating } = useUpdateSublote();
  const { lotes } = useLoteList();

  const [nombreSublote, setNombreSublote] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [coordenadas, setCoordenadas] = useState<CoordenadaSublote[]>([]);
  const [area, setArea] = useState(0);
  const [mensajeMapa, setMensajeMapa] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sublote) return;
    setNombreSublote(sublote.nombre_sublote || "");
    setCoordenadas(
      sublote.coordenadas_sublote?.map((c) => ({
        latitud_sublote: c.latitud_sublote,
        longitud_sublote: c.longitud_sublote,
      })) || []
    );
    setArea(sublote.area_sublote || 0);
    setLoteSeleccionado(String(sublote.lote?.id_lote_pk || ""));
  }, [sublote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreSublote.trim()) {
      setErrorNombre("El nombre del sublote es obligatorio.");
      return;
    }
    if (
      sublotes.some(
        (s) =>
          s.nombre_sublote === nombreSublote.trim() &&
          s.id_sublote_pk !== subloteId
      )
    ) {
      setErrorNombre("El nombre del sublote ya existe.");
      return;
    }
    setErrorNombre("");

    if (!loteSeleccionado) {
      setMensajeMapa("Debes seleccionar un lote.");
      return;
    }
    if (coordenadas.length < 3) {
      setMensajeMapa("Debes colocar al menos 3 puntos en el mapa.");
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setMensajeMapa("");

    try {
      const payload: CreateSubloteDTO = {
        nombre_sublote: nombreSublote.trim(),
        area_sublote: area,
        coordenadas_sublote: coordenadas.map((c) => ({
          latitud_sublote: c.latitud_sublote,
          longitud_sublote: c.longitud_sublote,
        })),
        id_lote_fk: Number(loteSeleccionado),
      };
      await updateSublote(subloteId, payload);
      navigate("/sublotes/listar");
    } catch {
      setMensajeMapa("No se pudo actualizar el sublote.");
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loadingSublote) return <p>Cargando sublote...</p>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-y-scroll h-[calc(100vh-10rem)] space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Editar Sublote</h2>
      </div>

      <div ref={mapContainerRef}>
        <SubloteMap
          coordenadas={coordenadas}
          setCoordenadas={setCoordenadas}
          setArea={setArea}
          sublotesExistentes={sublotes.filter(
            (s) => s.id_sublote_pk !== subloteId
          )}
          lotes={lotes}
          loteSeleccionado={loteSeleccionado}
          setLoteSeleccionado={setLoteSeleccionado}
          mensaje={mensajeMapa}
          clearMensaje={() => setMensajeMapa("")}
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
        removeCoord={(i) =>
          setCoordenadas(coordenadas.filter((_, idx) => idx !== i))
        }
        errorNombre={errorNombre}
        isLoading={updating}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/sublotes/listar")}
      />
    </div>
  );
}
