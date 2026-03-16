const fs = require('fs');
const { PROPERTY_DATA_PATH } = require('../config');

let _cache = null;

function loadProperties() {
  if (_cache) return _cache;

  if (!fs.existsSync(PROPERTY_DATA_PATH)) {
    throw new Error(`Property data file not found at: ${PROPERTY_DATA_PATH}`);
  }

  const raw = fs.readFileSync(PROPERTY_DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);

  // Support both a top-level array and a wrapped { properties: [] }
  _cache = Array.isArray(data) ? data : data.properties || [];
  console.log(`[loader] Loaded ${_cache.length} properties from ${PROPERTY_DATA_PATH}`);
  return _cache;
}

module.exports = { loadProperties };
