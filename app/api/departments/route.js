import { NextResponse } from 'next/server';
import { DEPARTMENTS } from '@/lib/constants/departments';

export async function GET() {
  return NextResponse.json(DEPARTMENTS);
}
