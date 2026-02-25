import { NextResponse } from 'next/server';
import { getQuotaStatus } from '@/lib/services/placesQuota';

export async function GET() {
  try {
    const status = await getQuotaStatus();
    return NextResponse.json(status);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
