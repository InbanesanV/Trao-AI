// ─── Core Entity Types ─────────────────────────────────────────────────────────

export interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface ItineraryDay {
  dayNumber: number;
  activities: Activity[];
}

export interface Hotel {
  _id?: string;
  name: string;
  tier: string;
  estimatedCostNightUSD: number;
  rating: string;
  amenities?: string[];
}

export interface EstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface PackingItem {
  _id?: string;
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Other';
  isPacked: boolean;
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  estimatedBudget: EstimatedBudget;
  packingList: PackingItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// ─── API Response Wrappers ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface TripResponse {
  success: boolean;
  trip: Trip;
  message?: string;
}

export interface TripsResponse {
  success: boolean;
  trips: Trip[];
}

// ─── Form Types ────────────────────────────────────────────────────────────────

export interface CreateTripFormData {
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
