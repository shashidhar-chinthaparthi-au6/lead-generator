/**
 * Monthly free-tier quota for Google Places API.
 * Usage is stored in server/data/places-api-usage.json and resets each calendar month.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USAGE_FILE = path.join(__dirname, '../data/places-api-usage.json');

const DEFAULT_MONTHLY_LIMIT = 5000; // free tier; adjust to match Google’s limit you want to enforce

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isEnabled() {
  const v = process.env.GOOGLE_PLACES_API_ENABLED || '';
  return v.toLowerCase() === 'true' || v === '1';
}

function getMonthlyLimit() {
  const n = parseInt(process.env.FREE_TIER_MONTHLY_LIMIT || '', 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MONTHLY_LIMIT;
}

/**
 * Load usage for current month. If file has a different month, count is 0.
 */
async function loadUsage() {
  try {
    const raw = await fs.readFile(USAGE_FILE, 'utf8');
    const data = JSON.parse(raw);
    const month = currentMonth();
    if (data.month !== month) {
      return { month, count: 0 };
    }
    return { month: data.month, count: Math.max(0, Number(data.count) || 0) };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { month: currentMonth(), count: 0 };
    }
    throw err;
  }
}

async function saveUsage(usage) {
  await fs.mkdir(path.dirname(USAGE_FILE), { recursive: true });
  await fs.writeFile(USAGE_FILE, JSON.stringify(usage, null, 2), 'utf8');
}

/**
 * Ensures API is enabled and quota is not exceeded. Call before making any Places API request.
 * @throws Error if disabled or monthly quota exceeded
 */
export function checkCanCallPlacesApi() {
  if (!isEnabled()) {
    throw new Error(
      'Google Places API is disabled. Set GOOGLE_PLACES_API_ENABLED=true in .env to use it.'
    );
  }
}

/**
 * Returns current month usage and limit (for display). Does not throw.
 */
export async function getQuotaStatus() {
  const usage = await loadUsage();
  return {
    month: usage.month,
    used: usage.count,
    limit: getMonthlyLimit(),
    enabled: isEnabled(),
  };
}

/**
 * Reserve and record one API call. Call this once per Text Search request and once per Place Details request.
 * @throws Error if monthly quota would be exceeded
 */
export async function incrementUsage() {
  const limit = getMonthlyLimit();
  const usage = await loadUsage();
  if (usage.count >= limit) {
    throw new Error(
      `You have completed your monthly quota (free tier). Limit: ${limit} requests/month. Usage resets next month (${usage.month}).`
    );
  }
  usage.count += 1;
  await saveUsage(usage);
}
