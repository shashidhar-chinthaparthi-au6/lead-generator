import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lead from '@/lib/models/Lead';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { type, note } = await request.json();
    const lead = await Lead.findById(params.id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    lead.activities.push({ type: type || 'Note', note: note || '' });
    await lead.save();
    const added = lead.activities[lead.activities.length - 1];
    return NextResponse.json(added, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
