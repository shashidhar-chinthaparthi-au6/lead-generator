import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true }, // mandatory for all leads
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    department: { type: String, default: '' }, // lead's business type: Hospitals, Restaurants, etc.
    offering: { type: String, default: '' },   // your product: Subdomain Website, Portfolio, etc.
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    sourceCategory: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'contact', 'conversation'],
      default: 'draft',
    },
    activities: [activitySchema],
  },
  { timestamps: true }
);

leadSchema.index({ source: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ city: 1 });
leadSchema.index({ department: 1 });
leadSchema.index({ offering: 1 });
leadSchema.index({ state: 1 });
leadSchema.index({ country: 1 });

export default mongoose.model('Lead', leadSchema);
