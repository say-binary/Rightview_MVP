const cache = require('../geocoding/cache');
const { geocodeAddress } = require('../geocoding/geocoder');

/**
 * Builds the geocode lookup key for a property using a waterfall:
 * 1. Real locality (locality != city) → "Locality, City, India"
 * 2. Extract sub-locality from project_name title
 * 3. Fallback → "City, India"
 */
function buildGeoKey(property) {
  const { city, locality } = property.location;

  // Waterfall 1: locality is a real sub-area
  if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
    return `${locality}, ${city}, India`;
  }

  // Waterfall 2: try to extract from project_name
  // e.g. "3 BHK Flat for Sale in Lodha Adrina, Worli, Mumbai"
  const projectName = property.builder_info?.project_name || '';
  const inMatch = projectName.match(/\bin\s+[^,]+,\s*([^,]+),/i);
  if (inMatch) {
    const extracted = inMatch[1].trim();
    if (extracted && extracted.toLowerCase() !== city?.toLowerCase()) {
      return `${extracted}, ${city}, India`;
    }
  }

  // Waterfall 3: city center fallback
  return `${city}, India`;
}

/**
 * Returns coordinates for a property.
 * Uses existing coordinates if present, otherwise cache → API.
 */
async function getCoordinates(property) {
  const existing = property.location?.coordinates;
  if (existing?.latitude && existing?.longitude) {
    return { latitude: existing.latitude, longitude: existing.longitude };
  }

  const key = buildGeoKey(property);
  const cached = cache.getFromCache(key);
  if (cached) {
    return { latitude: cached.latitude, longitude: cached.longitude };
  }

  const result = await geocodeAddress(key);
  if (result) {
    cache.saveToCache(key, result);
    return result;
  }

  return null;
}

/**
 * Pre-warms the geocode cache for all properties that lack coordinates.
 * Runs in the background after server start. Throttled to avoid rate limits.
 */
async function prewarmCache(properties) {
  const needsGeocode = properties.filter(p => {
    const c = p.location?.coordinates;
    return !c?.latitude || !c?.longitude;
  });

  // Deduplicate keys
  const keys = new Set();
  const work = [];
  for (const p of needsGeocode) {
    const key = buildGeoKey(p);
    if (!keys.has(key) && !cache.hasKey(key)) {
      keys.add(key);
      work.push({ key, property: p });
    }
  }

  if (work.length === 0) {
    console.log('[geocodeService] All coordinates already cached.');
    return;
  }

  console.log(`[geocodeService] Pre-warming ${work.length} geocode entries...`);

  for (let i = 0; i < work.length; i++) {
    const { key } = work[i];
    try {
      const result = await geocodeAddress(key);
      if (result) {
        cache.saveToCache(key, result);
        console.log(`[geocodeService] [${i + 1}/${work.length}] Geocoded: ${key}`);
      } else {
        console.warn(`[geocodeService] [${i + 1}/${work.length}] No result: ${key}`);
      }
    } catch (err) {
      console.error(`[geocodeService] Error geocoding "${key}":`, err.message);
    }
    // 150ms between calls → ~6-7 req/sec, well within Google's 50 QPS limit
    await new Promise(r => setTimeout(r, 150));
  }

  console.log('[geocodeService] Pre-warm complete.');
}

module.exports = { getCoordinates, prewarmCache, buildGeoKey };
