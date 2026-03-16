const express = require('express');
const router = express.Router();
const { loadProperties } = require('../data/loader');

router.get('/', (req, res) => {
  let count = 0;
  try { count = loadProperties().length; } catch {}
  res.json({ status: 'ok', timestamp: new Date().toISOString(), propertiesLoaded: count });
});

module.exports = router;
