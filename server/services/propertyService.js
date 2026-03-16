const fs = require('fs');
const path = require('path');
const { IMAGES_DIR } = require('../config');
const { getCoordinates } = require('./geocodeService');

function applyFilters(properties, params) {
  let results = [...properties];

  if (params.bhk) {
    const bhkList = String(params.bhk).split(',').map(Number).filter(Boolean);
    if (bhkList.length > 0) {
      results = results.filter(p => bhkList.includes(p.property_details?.bedroom_count));
    }
  }
  if (params.minPrice) {
    results = results.filter(p => (p.price?.value || 0) >= Number(params.minPrice));
  }
  if (params.maxPrice) {
    results = results.filter(p => (p.price?.value || 0) <= Number(params.maxPrice));
  }
  if (params.propertyType) {
    const types = String(params.propertyType).split(',').map(s => s.trim().toLowerCase());
    results = results.filter(p => types.includes((p.property_details?.property_type || '').toLowerCase()));
  }
  if (params.possession) {
    const possessions = String(params.possession).split(',').map(s => s.trim().toLowerCase());
    results = results.filter(p => possessions.includes((p.possession_status || '').toLowerCase()));
  }
  if (params.transactionType) {
    const txType = params.transactionType.toLowerCase();
    results = results.filter(p => (p.property_details?.transaction_type || '').toLowerCase() === txType);
  }
  if (params.city) {
    const city = params.city.toLowerCase();
    results = results.filter(p => (p.location?.city || '').toLowerCase() === city);
  }
  if (params.locality) {
    const loc = params.locality.toLowerCase();
    results = results.filter(p => {
      const fields = [p.location?.locality, p.location?.sub_locality, p.location?.full_address, p.builder_info?.project_name]
        .map(s => (s || '').toLowerCase());
      return fields.some(f => f.includes(loc));
    });
  }
  return results;
}

function applyBoundsFilter(properties, params) {
  const { swLat, swLng, neLat, neLng } = params;
  if (!swLat || !swLng || !neLat || !neLng) return properties;
  const sw = { lat: Number(swLat), lng: Number(swLng) };
  const ne = { lat: Number(neLat), lng: Number(neLng) };
  return properties.filter(p => {
    const c = p._resolvedCoords;
    if (!c) return false;
    return c.latitude >= sw.lat && c.latitude <= ne.lat && c.longitude >= sw.lng && c.longitude <= ne.lng;
  });
}

function buildImageUrls(property) {
  return (property.media?.images || []).map(img => {
    const filename = img.local_path ? path.basename(img.local_path) : 'img_01.jpg';
    const localPath = path.join(IMAGES_DIR, property.id, filename);
    const url = fs.existsSync(localPath)
      ? `/images/${property.id}/${filename}`
      : (img.url || null);
    return { url, title: img.title || '', type: img.type || '', order: img.order || 1 };
  }).filter(img => img.url);
}

async function getFilteredProperties(properties, params) {
  const filtered = applyFilters(properties, params);
  const resolved = await Promise.all(filtered.map(async p => ({ ...p, _resolvedCoords: await getCoordinates(p) })));
  const bounded = applyBoundsFilter(resolved, params);
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
