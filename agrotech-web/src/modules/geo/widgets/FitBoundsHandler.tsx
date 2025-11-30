import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface Props {
  polygons: [number, number][][];
}

const FitBoundsHandler = ({ polygons }: Props) => {
  const map = useMap();

  useEffect(() => {
    if (polygons.length > 0) {
      const allCoords = polygons.flat();
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [polygons, map]);

  return null;
};

export default FitBoundsHandler;
