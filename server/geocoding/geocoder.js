const { Client } = require('@googlemaps/google-maps-services-js');
const { GOOGLE_MAPS_API_KEY } = require('../config');

const client = new Client({});

async function geocodeAddress(address) {
  try {
    const response = await client.geocode({
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
        region: 'in',
      },
      timeout: 5000,
    });

    const results = response.data.results;
    if (!results || results.length === 0) {
      console.warn(`[geocoder] No results for: "${address}"`);
      return null;
    }

    const { lat, lng } = results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  } catch (err) {
    console.error(`[geocoder] Failed for "${address}":`, err.message);
    return null;
  }
}

module.exports = { geocodeAddress };
