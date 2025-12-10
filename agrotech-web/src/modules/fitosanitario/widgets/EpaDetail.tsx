 import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { useState, useMemo } from "react";
import type { Epa } from "../models/types";

export default function EpaDetail({ epa }: { epa: Epa }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = epa?.imagenesUrls || [];
  const hasMultipleImages = images.length > 1;

  const formatMeses = (meses?: number[]) => {
    if (!meses || meses.length === 0) return "No especificado";

    const nombresMeses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return meses
      .map(m => (m >= 1 && m <= 12 ? nombresMeses[m - 1] : m))
      .join(', ');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const resolveImageUrl = (src?: string) => {
    if (!src) return null;
    const val = String(src);
    if (/^(data:|blob:|https?:\/\/)/i.test(val)) return val;
    const FILES_BASE = "http://localhost:4000";
    const cleanBase = FILES_BASE.replace(/\/+$/, "");
    const rel = val.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
    return `${cleanBase}/${rel}`;
  };

  const currentImageUrl = useMemo(() => {
    if (images.length === 0) return null;
    return resolveImageUrl(images[currentImageIndex]);
  }, [images, currentImageIndex]);

  return (
    <div className="space-y-8">
      {/* Header con información principal */}
      <Card className="shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sección de imagen */}
            <div className="flex-shrink-0">
              {images.length > 0 ? (
                <div className="relative w-56 h-56 mx-auto lg:mx-0">
                  <img
                    src={currentImageUrl || ""}
                    alt={epa?.nombre}
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {hasMultipleImages && (
                    <>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/70 text-white hover:bg-black/90 rounded-full"
                        onClick={prevImage}
                      >
                        ‹
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/70 text-white hover:bg-black/90 rounded-full"
                        onClick={nextImage}
                      >
                        ›
                      </Button>
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full font-medium">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-56 h-56 bg-gradient-to-br from-default-50 to-default-100 rounded-2xl flex items-center justify-center text-default-400 border-2 border-dashed border-default-200 shadow-md">
                  <div className="text-center">
                    <div className="text-base font-medium">Sin imagen</div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección de información */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-default-900 mb-3">{epa?.nombre}</h1>
                <p className="text-lg text-default-600 leading-relaxed">{epa?.descripcion}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Chip
                  color="primary"
                  variant="flat"
                  size="lg"
                  className="font-semibold px-4 py-2"
                >
                  {epa?.tipoEpa?.nombre}
                </Chip>
                <Chip
                  color="secondary"
                  variant="flat"
                  size="lg"
                  className="font-semibold px-4 py-2"
                >
                  {epa?.tipoCultivoEpa?.nombre}
                </Chip>
              </div>

              {epa?.tags && epa.tags.length > 0 && (
                <div className="text-sm text-default-600">
                  <span className="font-medium">Etiquetas:</span> {epa.tags.join(", ")}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Información detallada organizada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda */}
        <div className="space-y-8">
          {/* Descripción */}
          <div>
            <h2 className="text-xl font-semibold text-default-900 mb-3">
              Descripción
            </h2>
            <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
              {epa?.descripcion || "No hay descripción disponible."}
            </p>
          </div>

          {/* Síntomas */}
          <div>
            <h2 className="text-xl font-semibold text-default-900 mb-3">
              Síntomas
            </h2>
            <p className="text-default-700 leading-relaxed whitespace-pre-wrap mb-4">
              {epa?.sintomas || "No hay información sobre síntomas."}
            </p>
            {epa?.fotosSintomas && epa.fotosSintomas.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {epa.fotosSintomas.map((url, idx) => (
                  <img
                    key={idx}
                    src={resolveImageUrl(url) || ""}
                    alt={`Síntoma ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-default-200 shadow-sm hover:shadow-md transition-shadow"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-8">
          {/* Manejo y Control */}
          <div>
            <h2 className="text-xl font-semibold text-default-900 mb-3">
              Manejo y Control
            </h2>
            <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
              {epa?.manejoYControl || "No hay información sobre manejo y control."}
            </p>
          </div>

          {/* Información Temporal */}
          <div>
            <h2 className="text-xl font-semibold text-default-900 mb-3">
              Información Temporal
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-default-900 mb-2">Meses de Riesgo</h3>
                <p className="text-default-700">
                  {formatMeses(epa?.mesesProbables)}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-default-900 mb-2">Temporadas</h3>
                <p className="text-default-700">
                  {epa?.temporadas?.join(", ") || "No especificado"}
                </p>
              </div>
              {epa?.notasEstacionalidad && (
                <div>
                  <h3 className="font-medium text-default-900 mb-2">Notas de Estacionalidad</h3>
                  <p className="text-default-700 italic">
                    {epa.notasEstacionalidad}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
