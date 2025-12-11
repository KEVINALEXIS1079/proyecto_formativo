import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import { GeoSearchControl } from "../../geo/components/GeoSearchControl";

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

// Import
import { validateLotePoint, validateLoteMove } from "../../geo/utils/spatial-validation";

// Update Props interface
interface Props {
    coordenadas: Coord[];
    setCoordenadas: (coords: Coord[]) => void;
    setArea: (area: number) => void;
    isEditing?: boolean;
    lotesExistentes?: any[];
    isSubloteView?: boolean;
    onError?: (message: string) => void;
    editingId?: number;
}

// ...
export default function LoteMap({ coordenadas, setCoordenadas, setArea, isEditing = true, lotesExistentes = [], onError, editingId }: Props) {
    const coords = coordenadas || [];

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (!isEditing) return;

        const rawPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
        let pointToAdd = { latitud_lote: rawPoint.lat, longitud_lote: rawPoint.lng };

        if (lotesExistentes && lotesExistentes.length > 0) {
            // Validate addition (Prev -> New)
            const prevPoint = coords.length > 0
                ? { lat: coords[coords.length - 1].latitud_lote, lng: coords[coords.length - 1].longitud_lote }
                : undefined;

            const validation = validateLotePoint(rawPoint, lotesExistentes, editingId, prevPoint);

            if (!validation.isValid && validation.correctedPoint) {
                pointToAdd = {
                    latitud_lote: validation.correctedPoint.lat,
                    longitud_lote: validation.correctedPoint.lng
                };
                if (onError && validation.message) onError(validation.message);
            }
        }

        // PREVENT DUPLICATE POINTS (User frustration fix)
        // If the new point (or corrected point) is too close to the last point, ignore it.
        // This prevents "stacking" points if the user keeps clicking in a restricted area that snaps to the same boundary spot.
        if (coords.length > 0) {
            const last = coords[coords.length - 1];
            const from = turf.point([last.longitud_lote, last.latitud_lote]);
            const to = turf.point([pointToAdd.longitud_lote, pointToAdd.latitud_lote]);
            const distance = turf.distance(from, to, { units: 'meters' });

            if (distance < 0.2) { // 20cm
                if (onError) onError("El punto está muy cerca del anterior.");
                return;
            }
        }

        const newCoords = [...coords, pointToAdd];
        setCoordenadas(newCoords);
    };

    // Calculate area (using smoothed or original? Standard says area of polygon defined by markers. 
    // If we visualizes curves, area technically changes. 
    // BUT usually "Lotes" legal boundaries are defined by points (vertices).
    // Let's stick to vertex-based area for legal accuracy unless specified. 
    // User asked for "Curvature" -> could be aesthetic.)
    // Let's stick to standard area for now to avoid confusion with data model.
    useEffect(() => {
        if (coords.length > 2) {
            const points = coords.map((c: any) => [c.longitud_lote, c.latitud_lote]);
            points.push(points[0]);
            const polygon = turf.polygon([points]);
            const calculatedArea = turf.area(polygon);
            setArea(calculatedArea);
        } else {
            setArea(0);
        }
    }, [coords, setArea]);

    const updatePosition = (index: number, lat: number, lng: number) => {
        let newLat = lat;
        let newLng = lng;

        // Auto-correct drag with Neighbor check
        if (lotesExistentes && lotesExistentes.length > 0 && coords.length > 1) {
            // Find Neighbors (Circle)
            const prevIndex = (index === 0) ? coords.length - 1 : index - 1;
            const nextIndex = (index === coords.length - 1) ? 0 : index + 1;

            const prev = { lat: coords[prevIndex].latitud_lote, lng: coords[prevIndex].longitud_lote };
            const next = { lat: coords[nextIndex].latitud_lote, lng: coords[nextIndex].longitud_lote };
            const current = { lat, lng };

            const validation = validateLoteMove(current, prev, next, lotesExistentes, editingId);
            if (!validation.isValid && validation.correctedPoint) {
                newLat = validation.correctedPoint.lat;
                newLng = validation.correctedPoint.lng;
                if (onError && validation.message) {
                    onError(validation.message);
                }
            }
        }

        const newCoords = [...coords];
        newCoords[index] = { latitud_lote: newLat, longitud_lote: newLng };
        setCoordenadas(newCoords);
    };

    const polyPositions = coords.map((c: any) => [c.latitud_lote, c.longitud_lote]);

    return (
        <MapContainer
            center={[1.8927, -76.0893]} // Tecnoparque Sena Yamboro Real
            zoom={17}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <MapEvents onClick={handleMapClick} />
            <GeoSearchControl />

            {/* Render Sublotes of existing Lotes (Context) */}
            {lotesExistentes && lotesExistentes.map((lote: any) => (
                lote.sublotes && lote.sublotes.map((sub: any) => {
                    // Check if valid
                    if (!sub.coordenadas_sublote || sub.coordenadas_sublote.length < 3) return null;
                    const pos = sub.coordenadas_sublote.map((c: any) => [c.latitud_sublote, c.longitud_sublote]);

                    return (
                        <Polygon
                            key={`sub-${sub.id_sublote_pk}`}
                            positions={pos}
                            pathOptions={{ color: "blue", fillColor: "#3b82f6", fillOpacity: 0.3, weight: 1 }}
                            interactive={false}
                        />
                    );
                })
            ))}

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
                    {/* Standard Polygon */}
                    <Polygon positions={polyPositions} pathOptions={{ color: "blue", weight: 3 }} />

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
