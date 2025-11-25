import { Input, Button, Card } from "@heroui/react";
import { useState } from "react";

type Props = {
  nombreLote: string;
  setNombreLote: (v: string) => void;
  area: number;
  coordenadas: { latitud: number; longitud: number }[];
  removeCoord: (i: number) => void;
  errorNombre: string; // mensaje de error (vacío si no hay)
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export default function LoteForm({
  nombreLote,
  setNombreLote,
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

  const campoVacio = tocado && !nombreLote.trim();
  const mostrarError = !!errorNombre || campoVacio;

  return (
    <Card className="p-8 shadow-sm border border-gray-200 mt-6">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* 🧾 Campo de nombre del lote con validación */}
        <div className="sm:col-span-2">
          <Input
            label="Nombre del lote"
            placeholder="Ej. Lote 1"
            value={nombreLote ?? ""}
            onChange={(e) => setNombreLote(e.target.value)}
            onBlur={() => setTocado(true)}
            isRequired
            isInvalid={mostrarError}
            errorMessage={
              campoVacio
                ? "Completa este campo"
                : errorNombre === "existe"
                ? "El nombre del lote ya existe."
                : errorNombre
            }
          />
        </div>

        {/*  Área */}
        <Input
          label="Área (m²)"
          value={area?.toString() ?? ""}
          readOnly
          variant="bordered"
          className="sm:col-span-2"
        />

        {/*  Coordenadas */}
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
                value={c.latitud?.toString() ?? ""}
                readOnly
              />
              <Input
                label={`Longitud ${i + 1}`}
                type="number"
                value={c.longitud?.toString() ?? ""}
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

        {/*  Botones */}
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
