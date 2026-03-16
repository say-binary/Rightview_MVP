const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'geocode_cache.json');
let _map = {};

function loadCache() {
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    _map = JSON.parse(raw);
    console.log(`[cache] Loaded ${Object.keys(_map).length} geocode entries from cache`);
  } catch {
    _map = {};
  }
}

function getFromCache(key) {
  return _map[key] || null;
}

function saveToCache(key, coords) {
  _map[key] = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    fetchedAt: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(_map, null, 2), 'utf-8');
  } catch (err) {
    console.error('[cache] Failed to write cache file:', err.message);
  }
}

function hasKey(key) {
  return key in _map;
}

module.exports = { loadCache, getFromCache, saveToCache, hasKey };
