import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const preferenceSnapshotSchema = new mongoose.Schema(
  {
    savedAt: { type: Date, default: Date.now },
    preferredLanguage: { type: String, default: '' },
    interested: { type: String, default: '' },
    interestedIn: [{ type: String }],
    customRequirement: { type: String, default: '' },
    followUpInterested: { type: String, default: '' },
    followUpDate: { type: Date, default: null },
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    department: { type: String, default: '' },
    offering: { type: String, default: '' },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    sourceCategory: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'contact', 'conversation'],
      default: 'draft',
    },
    preferredLanguage: { type: String, default: '' },
    interested: { type: String, default: '' }, // Yes, No, Maybe
    interestedIn: [{ type: String }], // multiple: Subdomain Website, Portfolio, etc.
    customRequirement: { type: String, default: '' }, // when not interested or custom
    followUpInterested: { type: String, default: '' }, // Yes, No
    followUpDate: { type: Date, default: null },
    preferenceHistory: [preferenceSnapshotSchema],
    activities: [activitySchema],
  },
  { timestamps: true }
);

leadSchema.index({ source: 1 });
leadSchema.index({ source: 1, sourceUrl: 1 }); // dedupe Google Places fetch
leadSchema.index({ status: 1 });
leadSchema.index({ city: 1 });
leadSchema.index({ department: 1 });
leadSchema.index({ offering: 1 });
leadSchema.index({ state: 1 });
leadSchema.index({ country: 1 });

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
