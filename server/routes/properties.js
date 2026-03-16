const express = require('express');
const router = express.Router();
const { loadProperties } = require('../data/loader');
const { getFilteredProperties } = require('../services/propertyService');

router.get('/', async (req, res) => {
  try {
    const properties = loadProperties();
    const result = await getFilteredProperties(properties, req.query);
    res.json(result);
  } catch (err) {
    console.error('[properties] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch properties', detail: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const properties = loadProperties();
    const property = properties.find(p => p.id === req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    const result = await getFilteredProperties([property], {});
    res.json(result.properties[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
