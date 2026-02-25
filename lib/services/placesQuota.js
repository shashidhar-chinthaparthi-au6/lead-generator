/**
 * Monthly free-tier quota for Google Places API.
 * Usage stored in data/places-api-usage.json (project root), resets each calendar month.
 */

import fs from 'fs/promises';
import path from 'path';

const USAGE_FILE = path.join(process.cwd(), 'data', 'places-api-usage.json');
const DEFAULT_MONTHLY_LIMIT = 5000;

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

async function loadUsage() {
  try {
    const raw = await fs.readFile(USAGE_FILE, 'utf8');
    const data = JSON.parse(raw);
    const month = currentMonth();
    if (data.month !== month) return { month, count: 0 };
    return { month: data.month, count: Math.max(0, Number(data.count) || 0) };
  } catch (err) {
    if (err.code === 'ENOENT') return { month: currentMonth(), count: 0 };
    throw err;
  }
}

async function saveUsage(usage) {
  await fs.mkdir(path.dirname(USAGE_FILE), { recursive: true });
  await fs.writeFile(USAGE_FILE, JSON.stringify(usage, null, 2), 'utf8');
}

export function checkCanCallPlacesApi() {
  if (!isEnabled()) {
    throw new Error(
      'Google Places API is disabled. Set GOOGLE_PLACES_API_ENABLED=true in .env to use it.'
    );
  }
}

export async function getQuotaStatus() {
  const usage = await loadUsage();
  return {
    month: usage.month,
    used: usage.count,
    limit: getMonthlyLimit(),
    enabled: isEnabled(),
  };
}

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
