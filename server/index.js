import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import locationsRouter from './routes/locations.js';
import departmentsRouter from './routes/departments.js';
import offeringsRouter from './routes/offerings.js';
import leadsRouter from './routes/leads.js';
import scrapeRouter from './routes/scrape.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/locations', locationsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/offerings', offeringsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/scrape', scrapeRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
