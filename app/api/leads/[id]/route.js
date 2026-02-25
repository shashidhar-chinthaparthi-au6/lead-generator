import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Lead from '@/lib/models/Lead';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const lead = await Lead.findById(params.id).lean();
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

const PREFERENCE_KEYS = ['preferredLanguage', 'interested', 'interestedIn', 'customRequirement', 'followUpInterested', 'followUpDate'];

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const { status, phone, followUpDate, ...rest } = body;

    // Use only MongoDB operators ($set, $push) so the update is valid
    const update = {};
    const setFields = {};

    if (status) setFields.status = status;
    if (followUpDate !== undefined) {
      setFields.followUpDate = followUpDate === null || followUpDate === '' ? null : followUpDate;
    }
    if (phone !== undefined) {
      const p = (phone || '').toString().trim();
      if (!p || p.replace(/\D/g, '').length < 10) {
        return NextResponse.json(
          { error: 'Phone number is required (at least 10 digits).' },
          { status: 400 }
        );
      }
      setFields.phone = p;
    }

    const hasPreferenceFields = PREFERENCE_KEYS.some((k) => body[k] !== undefined);
    if (hasPreferenceFields) {
      const current = await Lead.findById(params.id).lean();
      if (current) {
        const snapshot = {
          savedAt: new Date(),
          preferredLanguage: body.preferredLanguage !== undefined ? body.preferredLanguage : (current.preferredLanguage ?? ''),
          interested: body.interested !== undefined ? body.interested : (current.interested ?? ''),
          interestedIn: body.interestedIn !== undefined ? (Array.isArray(body.interestedIn) ? body.interestedIn : []) : (current.interestedIn ?? []),
          customRequirement: body.customRequirement !== undefined ? (body.customRequirement || '') : (current.customRequirement ?? ''),
          followUpInterested: body.followUpInterested !== undefined ? body.followUpInterested : (current.followUpInterested ?? ''),
          followUpDate: body.followUpDate !== undefined ? (body.followUpDate || null) : (current.followUpDate ?? null),
        };
        update.$push = { preferenceHistory: snapshot };
      }
      Object.assign(setFields, {
        ...(body.preferredLanguage !== undefined && { preferredLanguage: body.preferredLanguage }),
        ...(body.interested !== undefined && { interested: body.interested }),
        ...(body.interestedIn !== undefined && { interestedIn: Array.isArray(body.interestedIn) ? body.interestedIn : [] }),
        ...(body.customRequirement !== undefined && { customRequirement: body.customRequirement ?? '' }),
        ...(body.followUpInterested !== undefined && { followUpInterested: body.followUpInterested }),
        ...(body.followUpDate !== undefined && { followUpDate: body.followUpDate === null || body.followUpDate === '' ? null : body.followUpDate }),
      });
    }

    const otherKeys = Object.keys(rest).filter((k) => !PREFERENCE_KEYS.includes(k));
    for (const k of otherKeys) {
      if (rest[k] !== undefined) setFields[k] = rest[k];
    }
    if (Object.keys(setFields).length > 0) {
      update.$set = setFields;
    }

    const lead = await Lead.findByIdAndUpdate(params.id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
