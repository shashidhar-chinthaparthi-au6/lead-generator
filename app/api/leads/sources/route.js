import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lead from '@/lib/models/Lead';

export async function GET() {
  try {
    await connectDB();
    const fromDb = await Lead.distinct('source', { source: { $ne: '' } });
    const combined = [...new Set(['Google Places', 'Other', ...fromDb])].filter(Boolean).sort();
    return NextResponse.json(combined);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
