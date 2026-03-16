import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useMapBounds } from '../../hooks/useMapBounds';
import { isValidCoord } from '../../utils/mapHelpers';
import { formatPinLabel } from '../../utils/priceFormatter';
import styles from './MapView.module.css';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let googleMapsPromise = null;

function loadGoogleMaps() {
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      if (window.google?.maps?.Map) { resolve(); return; }
      window.__googleMapsCallback = resolve;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&v=weekly&loading=async&callback=__googleMapsCallback`;
      script.async = true;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return googleMapsPromise;
}

export default function MapView() {
  const { state, dispatch } = useApp();
  const { properties, activePropertyId, mapCenter, mapZoom } = state;

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  useMapBounds(mapRef);

  // Initialize map — no mapId so raster tiles load immediately
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || mapRef.current) return;
      mapRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        gestureHandling: 'greedy',
        disableDefaultUI: true,
        clickableIcons: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
        ],
      });
    });
    return () => { cancelled = true; };
  }, []);

  // Pan map when center changes
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.panTo(mapCenter);
    }
  }, [mapCenter]);

  // Update pins — use standard Marker (no mapId needed)
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const existingIds = new Set(markersRef.current.keys());
    const newIds = new Set(properties.map(p => p.id));

    // Remove stale markers
    for (const id of existingIds) {
      if (!newIds.has(id)) {
        markersRef.current.get(id).setMap(null);
        markersRef.current.delete(id);
      }
    }

    // Add / update markers
    for (const property of properties) {
      if (!isValidCoord(property.coordinates)) continue;
      const isActive = property.id === activePropertyId;
      const label = formatPinLabel(property.price?.value);

      if (markersRef.current.has(property.id)) {
        markersRef.current.get(property.id).setIcon(makePinIcon(label, isActive));
        continue;
      }

      const marker = new window.google.maps.Marker({
        map: mapRef.current,
        position: {
          lat: property.coordinates.latitude,
          lng: property.coordinates.longitude,
        },
        icon: makePinIcon(label, isActive),
        title: property.builder_info?.project_name || property.id,
        optimized: true,
      });

      marker.addListener('click', () => {
        dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: property.id });
        dispatch({ type: 'SET_SHEET_STATE', payload: 'peek' });
      });

      markersRef.current.set(property.id, marker);
    }
  }, [properties, activePropertyId]);

  // Update active pin highlight
  useEffect(() => {
    for (const [id, marker] of markersRef.current.entries()) {
      const property = properties.find(p => p.id === id);
      if (!property) continue;
      const label = formatPinLabel(property.price?.value);
      marker.setIcon(makePinIcon(label, id === activePropertyId));
    }
  }, [activePropertyId]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapDivRef} className={styles.mapInner} />
    </div>
  );
}

function makePinIcon(label, active) {
  const bg = active ? '%23dc2626' : '%231a56db';
  const w = Math.max(48, label.length * 8 + 20);
  const h = 28;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h + 8}'>
    <rect x='1' y='1' width='${w - 2}' height='${h - 2}' rx='13' fill='${bg}' stroke='white' stroke-width='1.5'/>
    <text x='${w / 2}' y='${h / 2 + 4}' text-anchor='middle' font-family='Arial,sans-serif' font-size='11' font-weight='bold' fill='white'>${label}</text>
    <polygon points='${w / 2 - 4},${h - 1} ${w / 2 + 4},${h - 1} ${w / 2},${h + 6}' fill='${bg}'/>
  </svg>`;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + svg,
    anchor: new window.google.maps.Point(w / 2, h + 8),
    scaledSize: new window.google.maps.Size(w, h + 8),
  };
}
