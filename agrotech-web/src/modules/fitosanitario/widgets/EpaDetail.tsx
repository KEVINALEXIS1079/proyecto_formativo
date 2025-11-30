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
    <div className="space-y-6">
      {/* Header con imagen y información básica */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start gap-4 w-full">
            {images.length > 0 ? (
              <div className="relative w-full md:w-auto flex justify-center">
                <div className="relative w-full md:w-48 h-48">
                    <img
                    src={currentImageUrl || ""}
                    alt={epa?.nombre}
                    className="w-full h-full object-cover rounded-lg"
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
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white"
                        onClick={prevImage}
                        >
                        ‹
                        </Button>
                        <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white"
                        onClick={nextImage}
                        >
                        ›
                        </Button>
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {currentImageIndex + 1} / {images.length}
                        </div>
                    </>
                    )}
                </div>
              </div>
            ) : (
              <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                Sin imagen
              </div>
            )}
            <div className="flex-1 w-full">
              <h1 className="text-2xl font-bold mb-2">{epa?.nombre}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Chip color="primary" variant="flat">
                  {epa?.tipoEpa?.nombre}
                </Chip>
                <Chip color="secondary" variant="flat">
                  {epa?.tipoCultivoEpa?.nombre}
                </Chip>
              </div>
              
              {epa?.tags && epa.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {epa.tags.map((tag, idx) => (
                        <Chip key={idx} size="sm" variant="bordered" className="text-default-500 border-default-300">
                            #{tag}
                        </Chip>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Descripción */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Descripción</h2>
        </CardHeader>
        <CardBody>
          <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
            {epa?.descripcion || "No hay descripción disponible."}
          </p>
        </CardBody>
      </Card>

      {/* Síntomas */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Síntomas</h2>
        </CardHeader>
        <CardBody>
          <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
            {epa?.sintomas || "No hay información sobre síntomas."}
          </p>
          {epa?.fotosSintomas && epa.fotosSintomas.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {epa.fotosSintomas.map((url, idx) => (
                      <img 
                        key={idx} 
                        src={resolveImageUrl(url) || ""} 
                        alt={`Síntoma ${idx + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border border-default-200"
                      />
                  ))}
              </div>
          )}
        </CardBody>
      </Card>

      {/* Manejo/Control */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Manejo y Control</h2>
        </CardHeader>
        <CardBody>
          <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
            {epa?.manejoYControl || "No hay información sobre manejo y control."}
          </p>
        </CardBody>
      </Card>

      {/* Información Temporal */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Información Temporal</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="col-span-1 md:col-span-2">
                    <h3 className="font-medium text-default-900 mb-2">Notas de Estacionalidad</h3>
                    <p className="text-default-700 italic">
                        {epa.notasEstacionalidad}
                    </p>
                </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}