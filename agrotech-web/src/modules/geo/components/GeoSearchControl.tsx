import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl as LeafletGeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Generic type for the control options if needed, or use any to bypass strict checks
// The library might not export the props interface directly or it might be incompatible.

export const GeoSearchControl = () => {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        // @ts-ignore - LeafletGeoSearchControl types can be tricky
        const searchControl = new LeafletGeoSearchControl({
            provider,
            style: 'button', // 'button' or 'bar'
            showMarker: true,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Buscar dirección...',
        });

        map.addControl(searchControl);

        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
};
