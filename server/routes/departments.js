import { Router } from 'express';

const router = Router();

// Lead's business type / industry (e.g. hospitals, restaurants)
export const DEPARTMENTS = [
  'Hospitals',
  'Clinics',
  'Restaurants',
  'Retail',
  'Schools',
  'Colleges',
  'Real Estate',
  'Automobiles',
  'Hotels',
  'Manufacturing',
  'Professional Services',
  'Salons & Spa',
  'Gyms & Fitness',
  'Electronics',
  'Construction',
  'Agriculture',
  'Other',
];

router.get('/', (req, res) => {
  res.json(DEPARTMENTS);
});

export default router;
