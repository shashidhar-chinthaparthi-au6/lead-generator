import { Router } from 'express';
import Lead from '../models/Lead.js';

const router = Router();

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

router.get('/', async (req, res, next) => {
  try {
    const { country, state, city, department, offering, source, status, page, limit } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (department) filter.department = department;
    if (offering) filter.offering = offering;
    if (source) filter.source = source;
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit, 10) || DEFAULT_PAGE_SIZE));
    const skip = (pageNum - 1) * pageSize;

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      Lead.countDocuments(filter),
    ]);

    res.json({
      leads,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/sources', async (req, res, next) => {
  try {
    const fromDb = await Lead.distinct('source', { source: { $ne: '' } });
    const combined = [...new Set(['Google Places', 'Other', ...fromDb])].filter(Boolean).sort();
    res.json(combined);
  } catch (err) {
    next(err);
  }
});

const LEGACY_SOURCES = ['OpenStreetMap', 'Google Maps', 'JustDial'];

router.delete('/legacy', async (req, res, next) => {
  try {
    const result = await Lead.deleteMany({ source: { $in: LEGACY_SOURCES } });
    res.json({ deleted: result.deletedCount, message: `Removed ${result.deletedCount} lead(s) from legacy sources.` });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).lean();
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const phone = (req.body.phone || '').toString().trim();
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Phone number is required (at least 10 digits).' });
    }
    const lead = await Lead.create({ ...req.body, phone });
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { status, phone, ...rest } = req.body;
    const update = { ...rest };
    if (status) update.status = status;
    if (phone !== undefined) {
      const p = (phone || '').toString().trim();
      if (!p || p.replace(/\D/g, '').length < 10) {
        return res.status(400).json({ error: 'Phone number is required (at least 10 digits).' });
      }
      update.phone = p;
    }
    const lead = await Lead.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/activities', async (req, res, next) => {
  try {
    const { type, note } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    lead.activities.push({ type: type || 'Note', note: note || '' });
    await lead.save();
    res.status(201).json(lead.activities[lead.activities.length - 1]);
  } catch (err) {
    next(err);
  }
});

export default router;
