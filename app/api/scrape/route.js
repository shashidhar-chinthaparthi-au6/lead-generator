import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lead from '@/lib/models/Lead';
import { searchPlaces } from '@/lib/services/googlePlaces';

const SOURCE = 'Google Places';
const MAX_FETCH_LIMIT = 200;

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, city, state, limit } = body;
    const requestedLimit =
      limit == null || limit === ''
        ? 60
        : Math.min(Number(limit) || 60, MAX_FETCH_LIMIT);

    const { leads: results, placesFound, detailsFetched, withPhone } = await searchPlaces({
      query: query || 'business',
      city: city || '',
      state: state || 'Maharashtra',
      limit: requestedLimit,
    });

    await connectDB();

    const saved = [];
    let skippedNoPhone = 0;
    let skippedDuplicate = 0;
    for (const item of results) {
      const phone = (item.phone || '').toString().trim();
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        skippedNoPhone += 1;
        continue;
      }
      const sourceUrl = (item.sourceUrl || '').trim();
      if (sourceUrl) {
        const existing = await Lead.findOne({
          source: SOURCE,
          sourceUrl,
        }).lean();
        if (existing) {
          skippedDuplicate += 1;
          continue;
        }
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

    const msgParts = [];
    if (saved.length) msgParts.push(`Saved ${saved.length} new lead(s) from Google Places.`);
    if (skippedNoPhone) msgParts.push(`${skippedNoPhone} skipped (no phone).`);
    if (skippedDuplicate) msgParts.push(`${skippedDuplicate} skipped (already in list).`);
    if (msgParts.length === 0) {
      if (placesFound === 0) {
        msgParts.push(`Google returned 0 places for "${query || 'business'}" in ${[city, state].filter(Boolean).join(', ') || 'this region'}. Try a different keyword or location.`);
      } else if (withPhone === 0) {
        msgParts.push(`Google found ${placesFound} place(s) but none had a phone number. Try a different keyword or location.`);
      } else {
        msgParts.push('No new leads. All results had no phone or were already in your list.');
      }
    }

    return NextResponse.json(
      {
        count: saved.length,
        leads: saved,
        skippedNoPhone,
        skippedDuplicate,
        placesFound: placesFound ?? null,
        withPhone: withPhone ?? null,
        message: msgParts.join(' '),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
