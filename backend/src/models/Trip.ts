import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── Sub-document interfaces ───────────────────────────────────────────────────

export interface IActivity {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface IItineraryDay {
  dayNumber: number;
  activities: IActivity[];
}

export interface IHotel {
  name: string;
  tier: string;
  estimatedCostNightUSD: number;
  rating: string;
  amenities?: string[];
}

export interface IEstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IPackingItem {
  _id?: Types.ObjectId;
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Other';
  isPacked: boolean;
}

// ─── Main Trip Document Interface ─────────────────────────────────────────────

export interface ITrip extends Document {
  userId: Types.ObjectId;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: IItineraryDay[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const ActivitySchema = new Schema<IActivity>({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  estimatedCostUSD: { type: Number, default: 0, min: 0 },
  timeOfDay: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
    default: 'Morning',
  },
});

const ItineraryDaySchema = new Schema<IItineraryDay>({
  dayNumber: { type: Number, required: true },
  activities: { type: [ActivitySchema], default: [] },
});

const HotelSchema = new Schema<IHotel>({
  name: { type: String, required: true },
  tier: { type: String, default: 'Standard' },
  estimatedCostNightUSD: { type: Number, default: 0 },
  rating: { type: String, default: 'N/A' },
  amenities: [{ type: String }],
});

const PackingItemSchema = new Schema<IPackingItem>({
  item: { type: String, required: true },
  category: {
    type: String,
    enum: ['Documents', 'Clothing', 'Gear', 'Other'],
    default: 'Other',
  },
  isPacked: { type: Boolean, default: false },
});

// ─── Main Trip Schema ──────────────────────────────────────────────────────────

const TripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for fast user-scoped queries
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: [1, 'Trip must be at least 1 day'],
      max: [30, 'Trip cannot exceed 30 days'],
    },
    budgetTier: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    interests: [{ type: String, trim: true }],
    itinerary: { type: [ItineraryDaySchema], default: [] },
    hotels: { type: [HotelSchema], default: [] },
    estimatedBudget: {
      transport: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    packingList: { type: [PackingItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model<ITrip>('Trip', TripSchema);
export default Trip;
