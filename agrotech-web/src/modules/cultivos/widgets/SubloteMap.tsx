import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Coord {
    latitud_sublote: number;
    longitud_sublote: number;
}

interface Props {
    coordenadas: Coord[];
    setCoordenadas: (coords: Coord[]) => void;
    setArea: (area: number) => void;
    loteSeleccionado?: string;
    lotes?: any[];
    isEditing?: boolean;
}

function MapEvents({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
    useMapEvents({
        click: onClick,
    });
    return null;
}

export default function SubloteMap({
    coordenadas,
    setCoordenadas,
    setArea,
    loteSeleccionado,
    lotes = [],
    isEditing = true
}: Props) {
    const coords = coordenadas || [];

    // Find parent lote polygon
    const parentLote = lotes.find((l: any) => String(l.id_lote_pk) === String(loteSeleccionado));
    const parentCoords = parentLote?.coordenadas_lote?.map((c: any) => [c.latitud_lote, c.longitud_lote]) || [];

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (!isEditing) return;
        // Format: { latitud_sublote, longitud_sublote } to match DTO
        const newPoint = { latitud_sublote: e.latlng.lat, longitud_sublote: e.latlng.lng };
        const newCoords = [...coords, newPoint];
        setCoordenadas(newCoords);
    };

    useEffect(() => {
        if (coords.length > 2) {
            // Calculate area
            // Map to [lng, lat] for Turf
            const points = coords.map((c: any) => [c.longitud_sublote, c.latitud_sublote]);
            points.push(points[0]); // Close ring
            const polygon = turf.polygon([points]);
            const calculatedArea = turf.area(polygon);
            setArea(calculatedArea);
        } else {
            setArea(0);
        }
    }, [coords, setArea]);

    const polyPositions = coords.map((c: any) => [c.latitud_sublote, c.longitud_sublote]);

    return (
        <MapContainer
            center={parentCoords.length > 0 ? parentCoords[0] : [1.8537, -76.0506]}
            zoom={13}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <MapEvents onClick={handleMapClick} />

            {/* Draw Parent Lote (Context) */}
            {/* Draw Parent Lote (Context) */}
            {parentCoords.length > 0 && (
                <Polygon
                    positions={parentCoords}
                    pathOptions={{ color: "gray", fillColor: "gray", fillOpacity: 0.1, dashArray: "5, 10" }}
                    interactive={false}
                />
            )}

            {/* Draw Sibling Sublotes (Context) */}
            {parentLote && parentLote.sublotes && parentLote.sublotes.map((s: any) => {
                if (!s.coordenadas_sublote || s.coordenadas_sublote.length < 3) return null;
                // Avoid drawing the sublote we are editing (if editing existing)
                // However, we don't have the current sublote ID here easily unless we pass it.
                // But usually 'coordenadas' state is what matters. Sibling polygons are background.
                const positions = s.coordenadas_sublote.map((c: any) => [c.latitud_sublote, c.longitud_sublote]);
                return (
                    <Polygon
                        key={`sibling-${s.id_sublote_pk}`}
                        positions={positions}
                        pathOptions={{
                            color: "green",
                            fillColor: "green",
                            fillOpacity: 0.2,
                            weight: 1,
                            dashArray: "2, 4"
                        }}
                        interactive={false}
                    />
                );
            })}

            {/* Draw Sublote (Active) */}
            {coords.length > 0 && (
                <>
                    <Polygon positions={polyPositions} pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.4 }} />
                    {coords.map((c: any, idx: number) => (
                        <Marker key={idx} position={[c.latitud_sublote, c.longitud_sublote]} />
                    ))}
                </>
            )}
        </MapContainer>
    );
}
