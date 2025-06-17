import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from "../../lib/api";

const Map = () => {
  const [mapKey, setMapKey] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/maptiler-key`)
      .then((res) => res.json())
      .then((data) => {
        setMapKey(data.key);
      })
      .catch((err) => {
        console.error('Failed to fetch MapTiler key:', err);
      });
  }, []);

  // Step 2: Once key is loaded, create the map
  useEffect(() => {
    if (!mapKey) return;

    const map = L.map('map', {
      center: [36, -75],
      zoom: 2,
      minZoom: 2.5,
      zoomControl: false
    });

    L.control.zoom({
  position: 'topright'
}).addTo(map);

    L.tileLayer(
      `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapKey}`,
      {
        tileSize: 256,
        noWrap: false,
        attribution:
          '&copy; <a href="https://www.maptiler.com/">MapTiler</a> ' +
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }
    ).addTo(map);

    return () => map.remove();
  }, [mapKey]);

  return <div id="map" style={{ height: 'calc(100vh - 80px)', width: '100%' }}></div>;
};

export default Map;
