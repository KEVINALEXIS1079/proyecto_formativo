import { Input, Button, Card, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { type Lote } from "../../lote/model/types";

type Props = {
  nombreSublote: string;
  setNombreSublote: (v: string) => void;
  loteSeleccionado: string;
  setLoteSeleccionado: (v: string) => void;
  lotes: Lote[];
  area: number;
  coordenadas: { latitud_sublote: number; longitud_sublote: number }[];
  removeCoord: (i: number) => void;
  errorNombre: string; // mensaje de error (vacío si no hay)
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export default function SubloteForm({
  nombreSublote,
  setNombreSublote,
  loteSeleccionado,
  setLoteSeleccionado,
  lotes,
  area,
  coordenadas,
  removeCoord,
  errorNombre,
  isLoading,
  onSubmit,
  onCancel,
}: Props) {
  const [tocado, setTocado] = useState(false); // detecta si se intentó enviar

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTocado(true);
    onSubmit(e);
  };

  const campoVacio = tocado && !nombreSublote.trim();
  const mostrarError = !!errorNombre || campoVacio;

  return (
    <Card className="p-8 shadow-sm border border-gray-200 mt-6">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* 🧾 Campo de nombre del sublote con validación */}
        <div className="sm:col-span-2">
          <Input
            label="Nombre del sublote"
            placeholder="Ej. Sublote A1"
            value={nombreSublote ?? ""}
            onChange={(e) => setNombreSublote(e.target.value)}
            onBlur={() => setTocado(true)}
            isRequired
            isInvalid={mostrarError}
            errorMessage={
              campoVacio
                ? "Completa este campo"
                : errorNombre === "existe"
                ? "El nombre del sublote ya existe."
                : errorNombre
            }
          />
        </div>

        {/* 🧱 Selección del lote asociado */}
        <Select
          label="Lote asociado"
          placeholder="Selecciona un lote"
          selectedKeys={new Set([loteSeleccionado])}
          onSelectionChange={(keys) =>
            setLoteSeleccionado(Array.from(keys)[0] as string)
          }
          variant="bordered"
          className="sm:col-span-2"
          isRequired
        >
          {lotes.map((lote) => (
            <SelectItem key={String(lote.id_lote_pk)}>
              {lote.nombre_lote}
            </SelectItem>
          ))}
        </Select>

        {/* 📏 Área */}
        <Input
          label="Área (m²)"
          value={area?.toString() ?? ""}
          readOnly
          variant="bordered"
          className="sm:col-span-2"
        />

        {/* 📍 Coordenadas seleccionadas */}
        <div className="sm:col-span-2">
          <h3 className="font-semibold mb-2">Coordenadas</h3>
          {coordenadas.length === 0 && (
            <p className="text-gray-500 text-sm italic">
              No has seleccionado puntos en el mapa.
            </p>
          )}
          {coordenadas.map((c, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <Input
                label={`Latitud ${i + 1}`}
                type="number"
                value={c.latitud_sublote?.toString() ?? ""}
                readOnly
              />
              <Input
                label={`Longitud ${i + 1}`}
                type="number"
                value={c.longitud_sublote?.toString() ?? ""}
                readOnly
              />
              <Button
                variant="solid"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onPress={() => removeCoord(i)}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>

        {/* 🔘 Botones de acción */}
        <div className="sm:col-span-2 flex justify-center mt-6 gap-4">
          <Button variant="light" onPress={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg font-medium shadow-sm transition"
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
