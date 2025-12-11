import { useRef, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Polygon,
    Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { GeoLote } from "../models/types";
import FitBoundsHandler from "./FitBoundsHandler.tsx";
import { GeoSearchControl } from "../components/GeoSearchControl.tsx";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Props {
    lotes: GeoLote[];
    isSubloteView?: boolean;
}

export default function GeoMap({ lotes, isSubloteView = false }: Props) {
    const mapRef = useRef<L.Map | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Collect all polygons to fit bounds
    const allPolygons = lotes.flatMap(l => {
        const polys = [];
        if (l.coordenadas_lote && l.coordenadas_lote.length > 0) {
            polys.push(l.coordenadas_lote.map(c => [c.latitud_lote, c.longitud_lote] as [number, number]));
        }
        if (l.sublotes) {
            l.sublotes.forEach(s => {
                if (s.coordenadas_sublote && s.coordenadas_sublote.length > 0) {
                    polys.push(s.coordenadas_sublote.map(c => [c.latitud_sublote, c.longitud_sublote] as [number, number]));
                }
            });
        }
        return polys;
    });

    return (
        <div className="h-full w-full rounded-xl overflow-hidden relative z-0 border border-gray-200 dark:border-gray-800 shadow-inner">
            <MapContainer
                center={[1.8537, -76.0506]} // Sena Yamboro
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <FitBoundsHandler polygons={allPolygons} />
                <GeoSearchControl />

                {lotes.map((lote, index) => (
                    <div key={`lote-${lote.id_lote_pk || index}`}>
                        {/* Lote Polygon */}
                        {lote.coordenadas_lote && lote.coordenadas_lote.length > 2 && (
                            <Polygon
                                positions={lote.coordenadas_lote.map(c => [c.latitud_lote, c.longitud_lote])}
                                pathOptions={{
                                    color: isSubloteView
                                        ? (hoveredId === `lote-${lote.id_lote_pk}` ? "#6b7280" : "#9ca3af") // Gray for sublote view
                                        : (hoveredId === `lote-${lote.id_lote_pk}` ? "#2563eb" : "#3b82f6"), // Blue for normal view
                                    fillColor: isSubloteView ? "#9ca3af" : "#3b82f6",
                                    fillOpacity: isSubloteView ? 0.1 : 0.2,
                                    weight: 2,
                                }}
                                eventHandlers={{
                                    mouseover: () => setHoveredId(`lote-${lote.id_lote_pk}`),
                                    mouseout: () => setHoveredId(null),
                                }}
                            >
                                <Tooltip sticky>
                                    <div className="text-sm space-y-1">
                                        <p className="font-bold text-base">{lote.nombre_lote}</p>
                                        <p className="text-xs text-gray-600">Lote #{lote.id_lote_pk}</p>
                                        <div className="border-t border-gray-200 pt-1 mt-1">
                                            <p><span className="font-semibold">Área:</span> {Math.round(lote.area_lote || 0).toLocaleString('es-CO')} m² ({((lote.area_lote || 0) / 10000).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha)</p>
                                            {lote.coordenadas_lote && lote.coordenadas_lote.length > 0 && (
                                                <>
                                                    <p><span className="font-semibold">Centroide:</span></p>
                                                    <p className="text-xs ml-2">
                                                        Lat: {(() => {
                                                            const val = lote.coordenadas_lote.reduce((sum, c) => sum + c.latitud_lote, 0) / lote.coordenadas_lote.length;
                                                            return isNaN(val) ? '0.0000' : val.toFixed(4);
                                                        })()}
                                                    </p>
                                                    <p className="text-xs ml-2">
                                                        Lng: {(() => {
                                                            const val = lote.coordenadas_lote.reduce((sum, c) => sum + c.longitud_lote, 0) / lote.coordenadas_lote.length;
                                                            return isNaN(val) ? '0.0000' : val.toFixed(4);
                                                        })()}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Tooltip>
                            </Polygon>
                        )}

                        {/* Sublotes Polygons */}
                        {lote.sublotes && lote.sublotes.map(sublote => (
                            sublote.coordenadas_sublote && sublote.coordenadas_sublote.length > 2 && (
                                <Polygon
                                    key={`sublote-${sublote.id_sublote_pk}`}
                                    positions={sublote.coordenadas_sublote.map(c => [c.latitud_sublote, c.longitud_sublote])}
                                    pathOptions={{
                                        color: hoveredId === `sublote-${sublote.id_sublote_pk}` ? "#2563eb" : "#3b82f6", // Blue-600 : Blue-500
                                        fillColor: "#3b82f6",
                                        fillOpacity: 0.4,
                                        weight: 2,
                                        dashArray: "5, 5"
                                    }}
                                    eventHandlers={{
                                        mouseover: () => setHoveredId(`sublote-${sublote.id_sublote_pk}`),
                                        mouseout: () => setHoveredId(null),
                                    }}
                                >
                                    <Tooltip sticky>
                                        <div className="text-sm space-y-1">
                                            <p className="font-bold text-base">{sublote.nombre_sublote}</p>
                                            <p className="text-xs text-gray-600">Sublote #{sublote.id_sublote_pk} (Lote: {lote.nombre_lote})</p>
                                            <div className="border-t border-gray-200 pt-1 mt-1">
                                                <p><span className="font-semibold">Área:</span> {Math.round(sublote.area_sublote || 0).toLocaleString('es-CO')} m² ({((sublote.area_sublote || 0) / 10000).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha)</p>
                                                {sublote.coordenadas_sublote && sublote.coordenadas_sublote.length > 0 && (
                                                    <>
                                                        <p><span className="font-semibold">Centroide:</span></p>
                                                        <p className="text-xs ml-2">
                                                            Lat: {(() => {
                                                                const val = sublote.coordenadas_sublote.reduce((sum, c) => sum + c.latitud_sublote, 0) / sublote.coordenadas_sublote.length;
                                                                return isNaN(val) ? '0.0000' : val.toFixed(4);
                                                            })()}
                                                        </p>
                                                        <p className="text-xs ml-2">
                                                            Lng: {(() => {
                                                                const val = sublote.coordenadas_sublote.reduce((sum, c) => sum + c.longitud_sublote, 0) / sublote.coordenadas_sublote.length;
                                                                return isNaN(val) ? '0.0000' : val.toFixed(4);
                                                            })()}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Tooltip>
                                </Polygon>
                            )
                        ))}
                    </div>
                ))}
            </MapContainer>
        </div>
    );
}
