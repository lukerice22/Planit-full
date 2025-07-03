const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

router.get('/', async (req, res) => {
  const input = req.query.input;
  const key = process.env.GOOGLE_API_KEY;

  if (!input || !key) {
    return res.status(400).json({ error: 'Missing input or API key' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${key}&types=geocode`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Autocomplete failed:', err);
    res.status(500).json({ error: 'Autocomplete failed' });
  }
});

module.exports = router;

router.get('/place-details', async (req, res) => {
  const placeId = req.query.placeId;
  const key = process.env.GOOGLE_API_KEY;

  if (!placeId || !key) {
    return res.status(400).json({ error: 'Missing placeId or API key' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Place details fetch failed:', err);
    res.status(500).json({ error: 'Place details fetch failed' });
  }
});