import { Router } from 'express';
import Lead from '../models/Lead.js';
import { searchPlaces } from '../services/googlePlaces.js';
import { getQuotaStatus } from '../services/placesQuota.js';

const router = Router();
const SOURCE = 'Google Places';
const MAX_FETCH_LIMIT = 200;

router.get('/quota', async (req, res, next) => {
  try {
    const status = await getQuotaStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { query, city, state, limit } = req.body;
    const requestedLimit =
      limit == null || limit === ''
        ? 60
        : Math.min(Number(limit) || 60, MAX_FETCH_LIMIT);

    const results = await searchPlaces({
      query: query || 'business',
      city: city || '',
      state: state || 'Maharashtra',
      limit: requestedLimit,
    });

    const saved = [];
    let skippedNoPhone = 0;
    for (const item of results) {
      const phone = (item.phone || '').toString().trim();
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        skippedNoPhone += 1;
        continue;
      }
      const lead = await Lead.create({
        ...item,
        phone,
        source: SOURCE,
        department: item.sourceCategory || '',
        country: 'India',
        status: 'draft',
      });
      saved.push(lead);
    }

    res.status(201).json({
      count: saved.length,
      leads: saved,
      skippedNoPhone,
      message: saved.length
        ? `Saved ${saved.length} lead(s) with phone from Google Places. ${skippedNoPhone} skipped (no phone).`
        : `No leads with phone found. ${skippedNoPhone} skipped (no phone). Try a different query or region.`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
