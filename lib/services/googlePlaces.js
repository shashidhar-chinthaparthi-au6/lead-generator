/**
 * Google Places API (Legacy) – Text Search + Place Details.
 */

import { checkCanCallPlacesApi, incrementUsage } from './placesQuota.js';

const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const DETAILS_FIELDS = 'name,formatted_phone_number,formatted_address,website';
const DELAY_BETWEEN_PAGES_MS = 2100;
const DELAY_BETWEEN_DETAILS_MS = 80;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function digitsOnly(str) {
  return (str || '').replace(/\D/g, '');
}

export async function searchPlaces(opts = {}) {
  checkCanCallPlacesApi();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set. Add it to .env and enable Places API in Google Cloud.');
  }

  const query = (opts.query || 'business').trim() || 'business';
  const city = (opts.city || '').trim();
  const state = (opts.state || '').trim();
  const limit = Math.min(Math.max(Number(opts.limit) || 60, 1), 200);

  const locationPart = city && state
    ? `${city}, ${state}, India`
    : state ? `${state}, India` : 'India';
  const searchQuery = `${query} in ${locationPart}`;

  const placeIds = [];
  let pageToken = null;

  do {
    await incrementUsage();
    const params = new URLSearchParams({ query: searchQuery, key: apiKey });
    if (pageToken) params.set('pagetoken', pageToken);
    const res = await fetch(`${TEXT_SEARCH_URL}?${params.toString()}`);
    const data = await res.json();

    if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
      const msg = data.error_message || data.status || 'Places API request failed.';
      console.error('[Places API]', data.status, msg);
      throw new Error(msg);
    }
    if (data.status === 'ZERO_RESULTS') break;
    if (data.status !== 'OK') {
      throw new Error(data.error_message || `Places API returned ${data.status}`);
    }

    for (const r of data.results || []) {
      if (r.place_id) placeIds.push(r.place_id);
    }
    pageToken = data.next_page_token || null;
    if (pageToken) await delay(DELAY_BETWEEN_PAGES_MS);
  } while (pageToken && placeIds.length < limit * 3);

  const leads = [];
  const baseUrl = 'https://www.google.com/maps/place/?q=place_id:';
  let detailsFetched = 0;
  let withPhone = 0;

  for (let i = 0; i < placeIds.length && leads.length < limit; i++) {
    await incrementUsage();
    const placeId = placeIds[i];
    const detailsParams = new URLSearchParams({
      place_id: placeId,
      fields: DETAILS_FIELDS,
      key: apiKey,
    });
    const detailsRes = await fetch(`${PLACE_DETAILS_URL}?${detailsParams.toString()}`);
    const detailsData = await detailsRes.json();

    if (i < placeIds.length - 1) await delay(DELAY_BETWEEN_DETAILS_MS);

    if (detailsData.status !== 'OK' || !detailsData.result) continue;
    detailsFetched += 1;
    const r = detailsData.result;
    const phone = (r.formatted_phone_number || '').trim();
    if (!phone || digitsOnly(phone).length < 10) continue;
    withPhone += 1;

    const website = (r.website || '').trim();
    leads.push({
      name: (r.name || '').trim() || 'Unknown',
      phone,
      address: (r.formatted_address || '').trim(),
      city: city || '',
      state: state || '',
      website: website || undefined,
      sourceUrl: `${baseUrl}${placeId}`,
      sourceCategory: query,
    });
  }

  return { leads, placesFound: placeIds.length, detailsFetched, withPhone };
}
