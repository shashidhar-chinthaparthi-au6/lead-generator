import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

function loadIndiaData() {
  const dataPath = path.join(process.cwd(), 'lib', 'data', 'india-states-cities.json');
  return JSON.parse(readFileSync(dataPath, 'utf8'));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'India';
  const state = searchParams.get('state') || '';
  if (country !== 'India' || !state) {
    return NextResponse.json([]);
  }
  const data = loadIndiaData();
  const cities = (data[state] || []).sort();
  return NextResponse.json(cities);
}
