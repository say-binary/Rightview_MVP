let currentController = null;

/**
 * Converts the filter object from AppContext into URL query params.
 */
function buildQueryString(filters) {
  const params = new URLSearchParams();

  if (filters.city) params.set('city', filters.city);
  if (filters.bhk?.length) params.set('bhk', filters.bhk.join(','));
  if (filters.minPrice != null) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice != null) params.set('maxPrice', filters.maxPrice);
  if (filters.propertyType?.length) params.set('propertyType', filters.propertyType.join(','));
  if (filters.possession?.length) params.set('possession', filters.possession.join(','));
  if (filters.transactionType) params.set('transactionType', filters.transactionType);
  if (filters.locality) params.set('locality', filters.locality);

  // Bounds filter intentionally omitted — show all matching properties across the map
  return params.toString();
}

/**
 * Fetches filtered properties from the backend.
 * Cancels any previous in-flight request automatically.
 */
export async function fetchProperties(filters) {
  if (currentController) currentController.abort();
  currentController = new AbortController();

  const qs = buildQueryString(filters);
  const url = `/api/properties${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, { signal: currentController.signal });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

/**
 * Geocodes an address string → { latitude, longitude }
 */
export async function geocodeAddress(address) {
  const response = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!response.ok) return null;
  return response.json();
}
