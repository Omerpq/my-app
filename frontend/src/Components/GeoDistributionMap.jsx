// src/components/GeoDistributionMap.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Minimal change: Set default marker images to red instead of blue.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to auto-fit the map to all markers
function FitBounds({ data }) {
  const map = useMap();

  useEffect(() => {
    if (data.length > 0) {
      const bounds = L.latLngBounds();
      data.forEach(item => {
        bounds.extend([item.latitude, item.longitude]);
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data, map]);

  return null;
}

const GeoDistributionMap = ({ darkMode, data = [] }) => {
  // Fallback center if no markers exist
  const center = data.length ? [data[0].latitude, data[0].longitude] : [20, 0];

  // Use Carto's dark-themed tile layer when darkMode is true; otherwise standard OSM tiles
  const tileLayerUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = darkMode
    ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <MapContainer center={center} zoom={5} style={{ height: '500px', width: '100%' }}>
      <TileLayer url={tileLayerUrl} attribution={attribution} />
      <FitBounds data={data} />
      {data.map((item, index) => (
        <Marker key={index} position={[item.latitude, item.longitude]}>
          <Popup>
            <strong>{item.name}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default GeoDistributionMap;
