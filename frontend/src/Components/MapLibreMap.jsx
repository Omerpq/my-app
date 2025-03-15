// src/components/MapLibreMap.jsx
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapLibreMap = ({ darkMode, data = [] }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Carto's Voyager GL style for light mode (colorful & detailed),
    // and Dark Matter GL style for dark mode.
    const darkStyleUrl = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
    const lightStyleUrl = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
    const styleUrl = darkMode ? darkStyleUrl : lightStyleUrl;

    if (!mapRef.current) {
      // Initialize the map only once
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: data.length ? [data[0].longitude, data[0].latitude] : [0, 20],
        zoom: 5,
      });
      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    } else {
      // If darkMode changes, update the style
      mapRef.current.setStyle(styleUrl);
    }

    // Clear existing markers by removing any old Marker elements
    // (For a production app, consider managing markers in state.)
    const existingMarkers = document.getElementsByClassName('maplibregl-marker');
    while (existingMarkers.length > 0) {
      existingMarkers[0].remove();
    }

    // Add red markers for each data point
    data.forEach((item) => {
      new maplibregl.Marker({ color: 'red' })
        .setLngLat([item.longitude, item.latitude])
        .setPopup(new maplibregl.Popup().setHTML(`<strong>${item.name}</strong>`))
        .addTo(mapRef.current);
    });

    // Auto-fit bounds if data exists
    if (data.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      data.forEach((item) => {
        bounds.extend([item.longitude, item.latitude]);
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [data, darkMode]);

  return <div ref={mapContainerRef} style={{ height: '500px', width: '100%' }} />;
};

export default MapLibreMap;
