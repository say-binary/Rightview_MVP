const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT, IMAGES_DIR } = require('./config');
const { loadProperties } = require('./data/loader');
const { loadCache } = require('./geocoding/cache');
const { prewarmCache } = require('./services/geocodeService');

const app = express();

app.use(cors());
app.use(express.json());

// Serve property images as static files
app.use('/images', express.static(IMAGES_DIR));

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/geocode', require('./routes/geocode'));

app.listen(PORT, async () => {
  console.log(`[server] Rightview API running on http://localhost:${PORT}`);

  // Load data and geocode cache
  loadCache();
  const properties = loadProperties();

  // Kick off background geocode pre-warm (non-blocking)
  prewarmCache(properties).catch(err =>
    console.error('[server] Pre-warm error:', err.message)
  );
});
