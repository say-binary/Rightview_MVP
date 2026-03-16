import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchProperties } from '../services/api';

export function usePropertyFilters() {
  const { state, dispatch } = useApp();
  const { filters } = state;
  const timerRef = useRef(null);

  useEffect(() => {
    // Debounce: 400ms for filter chips/map, immediate flag for chat submit
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await fetchProperties(filters);
        dispatch({ type: 'SET_PROPERTIES', payload: data });
      } catch (err) {
        if (err.name === 'AbortError') return; // cancelled request, ignore
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [filters]);
}
