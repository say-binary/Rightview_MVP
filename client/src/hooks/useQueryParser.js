import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { parseQuery, summariseParsed } from '../utils/queryParser';
import { geocodeAddress } from '../services/api';

export function useQueryParser() {
  const { dispatch } = useApp();

  const submit = useCallback(async (text) => {
    if (!text?.trim()) return;

    const parsed = parseQuery(text);
    const chips = summariseParsed(parsed);

    // Merge parsed result into existing filters
    const filterUpdate = {};
    if (parsed.bhk) filterUpdate.bhk = parsed.bhk;
    if (parsed.minPrice != null) filterUpdate.minPrice = parsed.minPrice;
    if (parsed.maxPrice != null) filterUpdate.maxPrice = parsed.maxPrice;
    if (parsed.propertyType) filterUpdate.propertyType = [parsed.propertyType];
    if (parsed.possession) filterUpdate.possession = [parsed.possession];
    if (parsed.transactionType) filterUpdate.transactionType = parsed.transactionType;
    if (parsed.locality) filterUpdate.locality = parsed.locality;
    if (parsed.city) filterUpdate.city = parsed.city;

    dispatch({ type: 'SET_FILTERS', payload: filterUpdate });
    dispatch({ type: 'SET_PARSED_CHIPS', payload: chips });
    dispatch({ type: 'SET_CHAT_QUERY', payload: text });

    // If a locality was parsed, geocode it and re-center the map
    const locationToGeocode = parsed.locality || parsed.city;
    if (locationToGeocode) {
      const suffix = parsed.locality && parsed.city
        ? `, ${parsed.city}, India`
        : ', India';
      const address = `${locationToGeocode}${suffix}`;

      const coords = await geocodeAddress(address);
      if (coords) {
        dispatch({
          type: 'SET_MAP_CENTER',
          payload: { lat: coords.latitude, lng: coords.longitude },
        });
      }
    }
  }, [dispatch]);

  return { submit };
}
