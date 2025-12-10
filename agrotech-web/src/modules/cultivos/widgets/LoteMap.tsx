import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
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
    latitud_lote: number;
    longitud_lote: number;
}

interface Props {
    coordenadas: Coord[];
    setCoordenadas: (coords: Coord[]) => void;
    setArea: (area: number) => void;
    isEditing?: boolean;
    lotesExistentes?: any[];
    isSubloteView?: boolean; // Added prop to support Sublote view in same map if needed
}

function MapEvents({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
    useMapEvents({
        click: onClick,
    });
    return null;
}

export default function LoteMap({ coordenadas, setCoordenadas, setArea, isEditing = true, lotesExistentes = [] }: Props) {
    const coords = coordenadas || [];

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (!isEditing) return;
        const newPoint = { latitud_lote: e.latlng.lat, longitud_lote: e.latlng.lng };
        const newCoords = [...coords, newPoint];
        setCoordenadas(newCoords);
    };

    // Calculate area when coords change
    useEffect(() => {
        if (coords.length > 2) {
            const points = coords.map((c: any) => [c.longitud_lote, c.latitud_lote]); // Turf uses Lon, Lat
            points.push(points[0]); // Close ring
            const polygon = turf.polygon([points]);
            const calculatedArea = turf.area(polygon);
            setArea(calculatedArea);
        } else {
            setArea(0);
        }
    }, [coords, setArea]);

    const updatePosition = (index: number, lat: number, lng: number) => {
        const newCoords = [...coords];
        newCoords[index] = { latitud_lote: lat, longitud_lote: lng };
        setCoordenadas(newCoords);
    };

    const polyPositions = coords.map((c: any) => [c.latitud_lote, c.longitud_lote]);

    return (
        <MapContainer
            center={[1.8537, -76.0506]} // Sena Yamboro
            zoom={13}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <MapEvents onClick={handleMapClick} />

            {/* Draw Existing Lotes (Context) */}
            {lotesExistentes && lotesExistentes.map((lote) => {
                if (!lote.coordenadas_lote || lote.coordenadas_lote.length < 3) return null;
                const positions = lote.coordenadas_lote.map((c: any) => [c.latitud_lote, c.longitud_lote]);
                return (
                    <Polygon
                        key={`existing-${lote.id_lote_pk}`}
                        positions={positions}
                        pathOptions={{
                            color: "gray",
                            fillColor: "#6b7280",
                            fillOpacity: 0.2,
                            weight: 1,
                            dashArray: "4, 4"
                        }}
                        interactive={false}
                    />
                );
            })}

            {coords.length > 0 && (
                <>
                    <Polygon positions={polyPositions} pathOptions={{ color: "blue" }} />
                    {coords.map((c: any, idx: number) => (
                        <DraggableMarker
                            key={idx}
                            index={idx}
                            position={[c.latitud_lote, c.longitud_lote]}
                            isDraggable={isEditing}
                            onDragEnd={updatePosition}
                        />
                    ))}
                </>
            )}
        </MapContainer>
    );
}

// Separate component for Marker to use eventHandlers easily
function DraggableMarker({
    position,
    index,
    isDraggable,
    onDragEnd
}: {
    position: [number, number];
    index: number;
    isDraggable: boolean;
    onDragEnd: (index: number, lat: number, lng: number) => void;
}) {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    onDragEnd(index, lat, lng);
                }
            },
        }),
        [index, onDragEnd]
    );

    return (
        <Marker
            draggable={isDraggable}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}
