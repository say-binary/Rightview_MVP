/**
 * Converts a google.maps.LatLngBounds object into flat query params.
 */
export function boundsToParams(bounds) {
  if (!bounds) return {};
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return {
    swLat: sw.lat(),
    swLng: sw.lng(),
    neLat: ne.lat(),
    neLng: ne.lng(),
  };
}

/**
 * Returns true if coordinates are valid.
 */
export function isValidCoord(coords) {
  return (
    coords &&
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    !isNaN(coords.latitude) &&
    !isNaN(coords.longitude)
  );
}
