const express = require('express');
const router = express.Router();
const cache = require('../geocoding/cache');
const { geocodeAddress } = require('../geocoding/geocoder');

router.post('/', async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'address is required' });

  const cached = cache.getFromCache(address);
  if (cached) {
    return res.json({ ...cached, fromCache: true });
  }

  const result = await geocodeAddress(address);
  if (!result) {
    return res.status(404).json({ error: `Could not geocode: "${address}"` });
  }

  cache.saveToCache(address, result);
  res.json({ ...result, fromCache: false });
});

module.exports = router;
