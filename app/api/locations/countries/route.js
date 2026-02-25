import { NextResponse } from 'next/server';

const COUNTRIES = [{ code: 'IN', name: 'India' }];

export async function GET() {
  return NextResponse.json(COUNTRIES);
}
