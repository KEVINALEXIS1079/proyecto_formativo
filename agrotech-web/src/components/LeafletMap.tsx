import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix Leaflet Default Icon Issue in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  polygon?: [number, number][]; // LatLng tuples
  markers?: { position: [number, number]; label: string }[];
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function LeafletMap({
  center = [4.5709, -74.2973], // Default Colombia
  zoom = 13,
  polygon,
  markers = [],
  height = "300px",
  onLocationSelect,
}: LeafletMapProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm z-0 relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={center} zoom={zoom} />

        {polygon && polygon.length > 0 && (
          <Polygon positions={polygon} pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.2 }} />
        )}

        {markers.map((m, idx) => (
          <Marker key={idx} position={m.position}>
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
        
        {/* Simple Click Handler */}
        {/* Implementation note: useMapEvents is better for refined interactions, keep simple for now */}
      </MapContainer>
    </div>
  );
}
