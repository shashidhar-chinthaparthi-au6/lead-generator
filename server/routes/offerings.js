import { Router } from 'express';

const router = Router();

// Your business offerings / product models (what you sell to the lead)
export const OFFERINGS = [
  'Subdomain Website Model',
  'Portfolio-as-a-Service',
  'Digital Visiting Card',
  'Monthly Subscription / Rent-a-Site',
  'WhatsApp Catalogue Site',
  'Student/Fresher Resume Site',
];

router.get('/', (req, res) => {
  res.json(OFFERINGS);
});

export default router;
