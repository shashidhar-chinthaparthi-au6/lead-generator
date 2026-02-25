import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lead from '@/lib/models/Lead';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const interested = searchParams.get('interested');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10)));

    const filter = {};
    if (country) filter.country = country;
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (source) filter.source = source;
    if (status) filter.status = status;
    if (interested) filter.interested = interested;

    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ updatedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(filter),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const phone = (body.phone || '').toString().trim();
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: 'Phone number is required (at least 10 digits).' },
        { status: 400 }
      );
    }
    const lead = await Lead.create({ ...body, phone });
    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
