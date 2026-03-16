const { getCoordinates } = require('./geocodeService');

/**
 * Applies all filter params to the in-memory properties array.
 * Returns a filtered array (coordinates not yet resolved at this stage).
 */
function applyFilters(properties, params) {
  let results = [...properties];

  // BHK filter (comma-separated bedroom counts)
  if (params.bhk) {
    const bhkList = String(params.bhk).split(',').map(Number).filter(Boolean);
    if (bhkList.length > 0) {
      results = results.filter(p =>
        bhkList.includes(p.property_details?.bedroom_count)
      );
    }
  }

  // Price filters (in rupees)
  if (params.minPrice) {
    const min = Number(params.minPrice);
    results = results.filter(p => (p.price?.value || 0) >= min);
  }
  if (params.maxPrice) {
    const max = Number(params.maxPrice);
    results = results.filter(p => (p.price?.value || 0) <= max);
  }

  // Property type (comma-separated)
  if (params.propertyType) {
    const types = String(params.propertyType).split(',').map(s => s.trim().toLowerCase());
    results = results.filter(p =>
      types.includes((p.property_details?.property_type || '').toLowerCase())
    );
  }

  // Possession status (comma-separated)
  if (params.possession) {
    const possessions = String(params.possession).split(',').map(s => s.trim().toLowerCase());
    results = results.filter(p =>
      possessions.includes((p.possession_status || '').toLowerCase())
    );
  }

  // Transaction type
  if (params.transactionType) {
    const txType = params.transactionType.toLowerCase();
    results = results.filter(p =>
      (p.property_details?.transaction_type || '').toLowerCase() === txType
    );
  }

  // City filter
  if (params.city) {
    const city = params.city.toLowerCase();
    results = results.filter(p =>
      (p.location?.city || '').toLowerCase() === city
    );
  }

  // Locality filter (substring match across multiple fields)
  if (params.locality) {
    const loc = params.locality.toLowerCase();
    results = results.filter(p => {
      const fields = [
        p.location?.locality,
        p.location?.sub_locality,
        p.location?.full_address,
        p.builder_info?.project_name,
      ].map(s => (s || '').toLowerCase());
      return fields.some(f => f.includes(loc));
    });
  }

  return results;
}

/**
 * Filters properties by whether their coordinates fall within the given map bounds.
 * Only applied if all four bound values are provided.
 */
function applyBoundsFilter(properties, params) {
  const { swLat, swLng, neLat, neLng } = params;
  if (!swLat || !swLng || !neLat || !neLng) return properties;

  const sw = { lat: Number(swLat), lng: Number(swLng) };
  const ne = { lat: Number(neLat), lng: Number(neLng) };

  return properties.filter(p => {
    const coords = p._resolvedCoords;
    if (!coords) return false;
    return (
      coords.latitude >= sw.lat &&
      coords.latitude <= ne.lat &&
      coords.longitude >= sw.lng &&
      coords.longitude <= ne.lng
    );
  });
}

/**
 * Rewrites local image paths to Express-served /images/ URLs.
 */
function buildImageUrls(property) {
  const images = (property.media?.images || []).map(img => ({
    url: `/images/${property.id}/${img.local_path?.split('/').pop() || 'img_01.jpg'}`,
    title: img.title || '',
    type: img.type || '',
    order: img.order || 1,
  }));
  return images;
}

/**
 * Main pipeline:
 * 1. Apply text/field filters
 * 2. Resolve coordinates for each result (cache-first)
 * 3. Apply bounds filter (requires coords)
 * 4. Build response payload
 */
async function getFilteredProperties(properties, params) {
  // Step 1: field filters
  let filtered = applyFilters(properties, params);

  // Step 2: resolve coordinates
  const resolved = await Promise.all(
    filtered.map(async p => {
      const coords = await getCoordinates(p);
      return { ...p, _resolvedCoords: coords };
    })
  );

  // Step 3: bounds filter (only if map bounds provided)
  const bounded = applyBoundsFilter(resolved, params);

  // Step 4: build clean response
  const result = bounded.map(p => ({
    id: p.id,
    source_site: p.source_site,
    listing_url: p.listing_url,
    coordinates: p._resolvedCoords || null,
    price: p.price,
    location: p.location,
    property_details: p.property_details,
    builder_info: p.builder_info,
    amenities: p.amenities || [],
    description: p.description || '',
    tags: p.tags || [],
    listed_by: p.listed_by,
    possession_status: p.possession_status,
    images: buildImageUrls(p),
  }));

  return { total: result.length, properties: result };
}

module.exports = { getFilteredProperties };
