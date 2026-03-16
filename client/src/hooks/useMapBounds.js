import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { boundsToParams } from '../utils/mapHelpers';

export function useMapBounds(mapRef) {
  const { dispatch } = useApp();
  const timerRef = useRef(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const listener = map.addListener('idle', () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const bounds = map.getBounds();
        if (bounds) {
          dispatch({ type: 'SET_MAP_BOUNDS', payload: boundsToParams(bounds) });
        }
      }, 500);
    });

    return () => {
      if (listener) listener.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mapRef.current]);
}
