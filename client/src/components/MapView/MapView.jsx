import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useApp } from '../../context/AppContext';
import { useMapBounds } from '../../hooks/useMapBounds';
import { isValidCoord } from '../../utils/mapHelpers';
import { formatPinLabel } from '../../utils/priceFormatter';
import styles from './MapView.module.css';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let googleMapsPromise = null;

function loadGoogleMaps() {
  if (!googleMapsPromise) {
    const loader = new Loader({
      apiKey: MAPS_API_KEY,
      version: 'weekly',
      libraries: ['marker'],
    });
    googleMapsPromise = loader.load();
  }
  return googleMapsPromise;
}

export default function MapView() {
  const { state, dispatch } = useApp();
  const { properties, activePropertyId, mapCenter, mapZoom } = state;

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // id → AdvancedMarkerElement

  useMapBounds(mapRef);

  // Initialize map
  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps().then(() => {
      if (cancelled || mapRef.current) return;

      mapRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        mapId: 'rightview_map',
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

  // Pan map when mapCenter changes (from chat query geocode)
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.panTo(mapCenter);
    }
  }, [mapCenter]);

  // Update pins when properties change
  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof window.google === 'undefined') return;

    const existingIds = new Set(markersRef.current.keys());
    const newIds = new Set(properties.map(p => p.id));

    // Remove stale markers
    for (const id of existingIds) {
      if (!newIds.has(id)) {
        markersRef.current.get(id).map = null;
        markersRef.current.delete(id);
      }
    }

    // Add / update markers
    for (const property of properties) {
      if (!isValidCoord(property.coordinates)) continue;

      if (markersRef.current.has(property.id)) {
        // Update active state
        const el = markersRef.current.get(property.id).content;
        if (el) {
          el.classList.toggle('active', property.id === activePropertyId);
        }
        continue;
      }

      // Create pin element
      const pinEl = document.createElement('div');
      pinEl.className = `rv-pin${property.id === activePropertyId ? ' active' : ''}`;
      pinEl.textContent = formatPinLabel(property.price?.value);

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: {
          lat: property.coordinates.latitude,
          lng: property.coordinates.longitude,
        },
        content: pinEl,
        title: property.builder_info?.project_name || property.id,
      });

      marker.addListener('click', () => {
        dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: property.id });
        dispatch({ type: 'SET_SHEET_STATE', payload: 'half' });
      });

      markersRef.current.set(property.id, marker);
    }
  }, [properties, activePropertyId]);

  // Update active pin highlight without re-rendering all pins
  useEffect(() => {
    for (const [id, marker] of markersRef.current.entries()) {
      const el = marker.content;
      if (el) el.classList.toggle('active', id === activePropertyId);
    }
  }, [activePropertyId]);

  return <div ref={mapDivRef} className={styles.mapContainer} />;
}
