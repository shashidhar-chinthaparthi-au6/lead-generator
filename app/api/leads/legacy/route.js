import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lead from '@/lib/models/Lead';

const LEGACY_SOURCES = ['OpenStreetMap', 'Google Maps', 'JustDial'];

export async function DELETE() {
  try {
    await connectDB();
    const result = await Lead.deleteMany({ source: { $in: LEGACY_SOURCES } });
    return NextResponse.json({
      deleted: result.deletedCount,
      message: `Removed ${result.deletedCount} lead(s) from legacy sources.`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
