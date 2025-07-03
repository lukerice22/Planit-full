import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from "../../lib/api";
import SearchBar from "../../components/PinsComponent/SearchBar";
import AddPin from "../../components/PinsComponent/AddPin";
import PinSidebar from "../../components/PinsComponent/PinSidebar";
import { collection, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { firestore } from "../../lib/firebase";
import greyPin from "../../assets/grey-pin.svg";
import redPin from "../../assets/red-pin.svg";

const Map = () => {
  const [mapKey, setMapKey] = useState(null);
  const [manualPinMode, setManualPinMode] = useState(false);
  const [tempPinData, setTempPinData] = useState(null);
  const [pins, setPins] = useState([]);
  const [selectedPinData, setSelectedPinData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mapRef = useRef(null);
  const tempMarkerRef = useRef(null);
  const confirmedMarkers = useRef([]);
  const searchInputRef = useRef(null);

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedPinData(null);
  };

  // Define pin icons
  const greyPinIcon = L.icon({ iconUrl: greyPin, iconSize: [50,50], iconAnchor: [25,50], popupAnchor: [0,-50] });
  const redPinIcon   = L.icon({ iconUrl: redPin,   iconSize: [50,50], iconAnchor: [25,50], popupAnchor: [0,-50] });


useEffect(() => {
  // when sidebarOpen===false ➞ collapsed state ➞ add class
  document.body.classList.toggle('nav-collapsed', !sidebarOpen);

  // cleanup on unmount, just in case
  return () => {
    document.body.classList.remove('nav-collapsed');
  };
}, [sidebarOpen]);


  // Fetch MapTiler key
  useEffect(() => {
    fetch(`${BASE_URL}/api/maptiler-key`)
      .then(res => res.json())
      .then(data => setMapKey(data.key))
      .catch(console.error);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapKey) return;
    const map = L.map('map', {
      center: [36, -75], zoom: 2, minZoom: 2.5,
      zoomControl: false, worldCopyJump: true
    });
    mapRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(
      `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapKey}`,
      { tileSize:256, noWrap:false }
    ).addTo(map);

    map.on('click', () => {
      if (!manualPinMode && tempMarkerRef.current) {
        map.removeLayer(tempMarkerRef.current);
        tempMarkerRef.current = null;
        setTempPinData(null);
      }
    });

    return () => map.remove();
  }, [mapKey]);

  // Manual pin placement handler
  useEffect(() => {
    if (!manualPinMode || !mapRef.current) return;
    const map = mapRef.current;
    const handler = e => {
      const { lat, lng } = e.latlng;
      addTempMarker(lat, lng, 'Dropped Pin');
      setManualPinMode(false);
    };
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [manualPinMode]);

  // Body class toggle for manual mode
  useEffect(() => {
    document.body.classList.toggle('manual-mode', manualPinMode);
    return () => document.body.classList.remove('manual-mode');
  }, [manualPinMode]);

  // Add a grey temporary marker
  const addTempMarker = (lat, lng, name) => {
    if (!mapRef.current) return;
    if (tempMarkerRef.current) mapRef.current.removeLayer(tempMarkerRef.current);
    const marker = L.marker([lat, lng], { icon: greyPinIcon }).addTo(mapRef.current);
    marker.bindPopup(`
      <div class="popup-content">
        <strong>${name}</strong>
        <div class="popup-buttons">
          <button class="popup-btn" onclick="window.addPinToMap()">Add Pin</button>
          <button class="popup-btn" onclick="window.removeTempPin()">Remove</button>
        </div>
      </div>
    `).openPopup();
    tempMarkerRef.current = marker;
    setTempPinData({ lat, lng, name });
    mapRef.current.flyTo([lat, lng], 13);
  };

  // Create or focus existing pin
  const addPinToMap = async () => {
    if (!tempPinData || !mapRef.current) return;
    const { lat, lng, name } = tempPinData;
    // check duplicate
    const existing = pins.find(p => p.lat === lat && p.lng === lng);
    if (existing) {
      mapRef.current.flyTo([lat, lng], 13);
      setSelectedPinData(existing);
      setSidebarOpen(true);
    } else {
      try {
        await addDoc(collection(firestore, 'pins'), {
          title: name,
          visited: false,
          priority: 0,
          date: '',
          notes: '',
          todoList: [],
          lat,
          lng,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Error creating pin:', err);
      }
    }
    // cleanup temp marker
    if (tempMarkerRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
    setTempPinData(null);
  };

  // Expose popup handlers
  useEffect(() => {
    window.addPinToMap = addPinToMap;
    window.removeTempPin = () => {
      if (tempMarkerRef.current) mapRef.current.removeLayer(tempMarkerRef.current);
      setTempPinData(null);
    };
  }, [tempPinData, pins]);

  // Load pins in real-time
  useEffect(() => {
    if (!mapKey || !mapRef.current) return;
    const unsub = onSnapshot(
      collection(firestore, 'pins'),
      snapshot => {
        const pinArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPins(pinArray);
        // clear old markers
        confirmedMarkers.current.forEach(m => mapRef.current.removeLayer(m));
        confirmedMarkers.current = [];
        // add red markers
        pinArray.forEach(p => {
          const m = L.marker([p.lat, p.lng], { icon: redPinIcon }).addTo(mapRef.current);
          m.bindPopup(`<strong>${p.title}</strong>`);
          m.on('click', () => {
            setSelectedPinData(p);
            setSidebarOpen(true);
          });
          confirmedMarkers.current.push(m);
        });
      },
      err => console.error('Failed to load pins:', err)
    );
    return () => unsub();
  }, [mapKey]);

  // Search selection handler (avoid duplicates)
  const handlePlaceSelect = ({ lat, lng, name }) => {
    const existing = pins.find(p => p.lat === lat && p.lng === lng);
    if (existing) {
      mapRef.current.flyTo([lat, lng], 13);
      setSelectedPinData(existing);
      setSidebarOpen(true);
    } else {
      addTempMarker(lat, lng, name);
    }
  };

  // AddPin dropdown handler
  const handleSelectMode = mode =>
    mode === 'search'
      ? searchInputRef.current?.focus()
      : setManualPinMode(true);

  // Close sidebar on outside click
  useEffect(() => {
    const onClickOutside = e => {
      const sb = document.querySelector('.pin-sidebar-wrapper');
      if (!sb?.contains(e.target) && !e.target.closest('.leaflet-popup-content')) {
        closeSidebar();
      }
    };
    if (sidebarOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [sidebarOpen]);

  return (
    <>
      <div className="top-bar-wrapper">
        <SearchBar onPlaceSelect={handlePlaceSelect} inputRef={searchInputRef} />
        <AddPin onSelectMode={handleSelectMode} />
      </div>
      <div id="map" style={{ height: 'calc(100vh - 80px)', width: '100%' }} />
      {manualPinMode && (
        <>
          <div className="manual-overlay" />
          <div className="manual-instruction">Click anywhere to drop a pin</div>
        </>
      )}
      {sidebarOpen && <div className="pin-sidebar-overlay" onClick={closeSidebar} />}
      <div className={`pin-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>        
        {selectedPinData && <PinSidebar pinData={selectedPinData} onClose={closeSidebar} />}      
      </div>
    </>
  );
};

export default Map;