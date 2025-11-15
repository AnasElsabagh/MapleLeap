import React, { useEffect, useRef } from 'react';

// Make Leaflet available from window if it's loaded via a script tag
declare const L: any;

interface WorldMapProps {
  highlightedCountries: string[];
}

// A simple lookup for country coordinates. This can be expanded.
const countryCoordinates: { [key: string]: [number, number] } = {
  'United States': [39.8283, -98.5795],
  'Germany': [51.1657, 10.4515],
  'United Kingdom': [55.3781, -3.4360],
  'Australia': [-25.2744, 133.7751],
  'Japan': [36.2048, 138.2529],
  'France': [46.6033, 1.8883],
  'Mexico': [23.6345, -102.5528],
  'Netherlands': [52.1326, 5.2913],
  'China': [35.8617, 104.1954],
  'Brazil': [-14.2350, -51.9253],
  'India': [20.5937, 78.9629],
  'South Korea': [35.9078, 127.7669],
  'Sweden': [60.1282, 18.6435],
  'Norway': [60.4720, 8.4689],
  'Singapore': [1.3521, 103.8198],
};

const WorldMap: React.FC<WorldMapProps> = ({ highlightedCountries }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // To hold the map instance
  const layerGroupRef = useRef<any>(null); // To hold the markers layer

  useEffect(() => {
    if (typeof L === 'undefined' || !mapContainerRef.current) {
      return;
    }

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [20, 10],
        zoom: 2,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    
    // Clear existing markers
    layerGroup.clearLayers();

    const markers: [number, number][] = [];
    highlightedCountries.forEach(country => {
      // Handle cases like "United States of America" vs "United States"
      const matchedCountry = Object.keys(countryCoordinates).find(key => key.includes(country) || country.includes(key));
      const coords = matchedCountry ? countryCoordinates[matchedCountry] : null;

      if (coords) {
        L.marker(coords).addTo(layerGroup).bindPopup(country);
        markers.push(coords);
      }
    });

    if (markers.length > 0) {
      map.fitBounds(markers, { padding: [50, 50], maxZoom: 5 });
    } else {
      map.setView([20, 10], 2);
    }
    
  }, [highlightedCountries]);

  if (typeof L === 'undefined') {
    return (
      <div style={{ height: '400px' }} className="bg-gray-900 rounded-lg flex items-center justify-center p-4">
        <div className="text-center text-gray-400">Loading Map...</div>
      </div>
    );
  }

  return <div ref={mapContainerRef} style={{ height: '400px' }} className="rounded-lg shadow-md z-0" />;
};

export default WorldMap;