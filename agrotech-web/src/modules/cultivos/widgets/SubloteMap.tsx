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

// Import
import { validateSublotePoint, validateSubloteMove } from "../../geo/utils/spatial-validation";

function DraggableMarker({ position, index, onDragEnd }: { position: [number, number], index: number, onDragEnd: (idx: number, lat: number, lng: number) => void }) {
    const markerRef = useRef<any>(null);

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
        [index, onDragEnd],
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

// Update Props
interface Props {
    coordenadas: Coord[];
    setCoordenadas: (coords: Coord[]) => void;
    setArea: (area: number) => void;
    loteSeleccionado?: string;
    lotes?: any[];
    isEditing?: boolean;
    onError?: (message: string) => void;
    editingId?: number;
}

// ...
export default function SubloteMap({
    coordenadas,
    setCoordenadas,
    setArea,
    loteSeleccionado,
    lotes = [],
    isEditing = true,
    onError,
    editingId
}: Props) {
    const coords = coordenadas || [];

    // Find parent lote polygon
    const parentLote = lotes.find((l: any) => String(l.id_lote_pk) === String(loteSeleccionado));
    const parentCoords = parentLote?.coordenadas_lote?.map((c: any) => [c.latitud_lote, c.longitud_lote]) || [];

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (!isEditing) return;

        const rawPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
        let pointToAdd = { latitud_sublote: rawPoint.lat, longitud_sublote: rawPoint.lng };

        // Validate and Auto-correct
        if (lotes.length > 0) {
            // Get siblings from parent
            const siblings = parentLote?.sublotes || [];

            // Previous point for segment validation
            const prevPoint = coords.length > 0
                ? { lat: coords[coords.length - 1].latitud_sublote, lng: coords[coords.length - 1].longitud_sublote }
                : undefined;

            const validation = validateSublotePoint(rawPoint, parentLote, siblings, editingId, prevPoint);

            if (!validation.isValid && validation.correctedPoint) {
                pointToAdd = {
                    latitud_sublote: validation.correctedPoint.lat,
                    longitud_sublote: validation.correctedPoint.lng
                };
                if (onError && validation.message) {
                    onError(validation.message);
                }
            }
        }

        const newCoords = [...coords, pointToAdd];
        setCoordenadas(newCoords);
    };

    const updatePosition = (index: number, lat: number, lng: number) => {
        let newLat = lat;
        let newLng = lng;

        // Auto-correct drag with Parent/Sibling check
        if (lotes.length > 0 && coords.length > 1) {
            const siblings = parentLote?.sublotes || [];

            // Find Neighbors
            const prevIndex = (index === 0) ? coords.length - 1 : index - 1;
            const nextIndex = (index === coords.length - 1) ? 0 : index + 1;

            const prev = { lat: coords[prevIndex].latitud_sublote, lng: coords[prevIndex].longitud_sublote };
            const next = { lat: coords[nextIndex].latitud_sublote, lng: coords[nextIndex].longitud_sublote };
            const current = { lat, lng };

            // NEED TO PASS PARENT LOTE AND SIBLINGS
            const validation = validateSubloteMove(current, prev, next, parentLote, siblings, editingId);

            if (!validation.isValid && validation.correctedPoint) {
                newLat = validation.correctedPoint.lat;
                newLng = validation.correctedPoint.lng;
                if (onError && validation.message) {
                    onError(validation.message);
                }
            }
        }

        const newCoords = [...coords];
        newCoords[index] = { latitud_sublote: newLat, longitud_sublote: newLng };
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
            center={parentCoords.length > 0 ? parentCoords[0] : [1.8927, -76.0893]}
            zoom={17}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <MapEvents onClick={handleMapClick} />
            <GeoSearchControl />

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
                const positions = s.coordenadas_sublote.map((c: any) => [c.latitud_sublote, c.longitud_sublote]);
                return (
                    <Polygon
                        key={`sibling-${s.id_sublote_pk}`}
                        positions={positions}
                        pathOptions={{
                            color: "gray",
                            fillColor: "gray",
                            fillOpacity: 0.5,
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
                    <Polygon positions={polyPositions} pathOptions={{ color: "blue", weight: 2, fillColor: "gray", fillOpacity: 0.5 }} />
                    {coords.map((c: any, idx: number) => (
                        isEditing ? (
                            <DraggableMarker
                                key={idx}
                                index={idx}
                                position={[c.latitud_sublote, c.longitud_sublote]}
                                onDragEnd={updatePosition}
                            />
                        ) : (
                            <Marker key={idx} position={[c.latitud_sublote, c.longitud_sublote]} />
                        )
                    ))}
                </>
            )}
        </MapContainer>
    );
}
