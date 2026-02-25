import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '../data/india-states-cities.json');

let indiaData = null;
function loadIndiaData() {
  if (!indiaData) {
    indiaData = JSON.parse(readFileSync(dataPath, 'utf8'));
  }
  return indiaData;
}

const router = Router();

const COUNTRIES = [{ code: 'IN', name: 'India' }];

router.get('/countries', (req, res) => {
  res.json(COUNTRIES);
});

router.get('/states', (req, res) => {
  const country = req.query.country || 'India';
  if (country !== 'India') {
    return res.json([]);
  }
  const data = loadIndiaData();
  const states = Object.keys(data).sort();
  res.json(states);
});

router.get('/cities', (req, res) => {
  const country = req.query.country || 'India';
  const state = req.query.state || '';
  if (country !== 'India' || !state) {
    return res.json([]);
  }
  const data = loadIndiaData();
  const cities = data[state] || [];
  res.json(cities.sort());
});

export default router;
