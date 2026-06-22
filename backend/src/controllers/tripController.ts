import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Trip, { IItineraryDay, IPackingItem } from '../models/Trip';

// ─── Gemini API Helpers ────────────────────────────────────────────────────────

interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * Fetch with exponential backoff retry for rate-limit resilience.
 * Retries up to `retries` times with doubling delay on 429 or network errors.
 */
async function fetchWithRetry(
  url: string,
  options: FetchOptions,
  retries = 5,
  delay = 1000
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`⚠️  Rate limited (429). Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      const errBody = await response.text();
      throw new Error(`Gemini API Error [${response.status}]: ${errBody}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      const err = error as Error;
      console.warn(`⚠️  Request failed (${err.message}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Build the structured prompt for Gemini to generate a full itinerary.
 */
function buildTripPrompt(
  destination: string,
  durationDays: number,
  budgetTier: string,
  interests: string[]
): string {
  const interestsList = interests.length > 0 ? interests.join(', ') : 'general sightseeing';

  return `
You are an expert AI travel planner specializing in creating highly personalized, realistic travel itineraries.

Create a detailed ${durationDays}-day travel plan for a trip to ${destination}.
Budget preference: ${budgetTier} (Low = budget hostels/street food, Medium = mid-range hotels/restaurants, High = luxury resorts/fine dining).
Traveler interests: ${interestsList}.

IMPORTANT: You must return ONLY a valid JSON object with NO additional text, markdown, or explanation.
The JSON must exactly match this structure:

{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "title": "Activity name (be specific, e.g. 'Visit Senso-ji Temple')",
          "description": "2-3 sentence description with practical details and tips",
          "estimatedCostUSD": 25,
          "timeOfDay": "Morning"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Specific real hotel name",
      "tier": "${budgetTier}",
      "estimatedCostNightUSD": 85,
      "rating": "4.2/5",
      "amenities": ["WiFi", "Breakfast included", "Pool"]
    }
  ],
  "estimatedBudget": {
    "transport": 120,
    "accommodation": 340,
    "food": 200,
    "activities": 150,
    "total": 810
  },
  "packingList": [
    { "item": "Passport", "category": "Documents", "isPacked": false },
    { "item": "Travel insurance documents", "category": "Documents", "isPacked": false },
    { "item": "Weather-appropriate clothing", "category": "Clothing", "isPacked": false },
    { "item": "Comfortable walking shoes", "category": "Gear", "isPacked": false }
  ]
}

Rules:
- Include 3-4 activities per day spread across Morning, Afternoon, and Evening.
- Budget estimates must be realistic for ${destination} and the ${budgetTier} tier.
- Recommend 2-3 real hotels near the destination.
- The packingList should have 12-18 items tailored to the destination climate and interests (${interestsList}).
- Include a mix of all 4 categories: Documents, Clothing, Gear, Other.
- Accommodation total = estimatedCostNightUSD × ${durationDays}.
- The "total" in estimatedBudget must equal transport + accommodation + food + activities.
`.trim();
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/trips/generate
 * Generate a new AI-powered trip itinerary and save to MongoDB.
 */
export const generateNewTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const { destination, durationDays, budgetTier, interests } = req.body;
  const userId = req.user?.id;

  // Input validation
  if (!destination || !durationDays || !budgetTier) {
    res.status(400).json({
      success: false,
      message: 'destination, durationDays, and budgetTier are required.',
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      success: false,
      message: 'Gemini API key is not configured on the server.',
    });
    return;
  }

  try {
    const prompt = buildTripPrompt(destination, durationDays, budgetTier, interests || []);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    };

    console.log(`🤖 Generating trip to ${destination} (${durationDays} days, ${budgetTier} budget)...`);

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('No content returned from Gemini API.');
    }

    // Parse the AI response
    const aiResult = JSON.parse(rawText);

    if (!aiResult.itinerary || !aiResult.estimatedBudget) {
      throw new Error('AI response is missing required fields (itinerary, estimatedBudget).');
    }

    // Save to MongoDB with strict user ownership
    const newTrip = new Trip({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests: interests || [],
      itinerary: aiResult.itinerary,
      hotels: aiResult.hotels || [],
      estimatedBudget: aiResult.estimatedBudget,
      packingList: aiResult.packingList || [],
    });

    const savedTrip = await newTrip.save();
    console.log(`✅ Trip saved: ${savedTrip._id} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: `Itinerary for ${destination} generated successfully!`,
      trip: savedTrip,
    });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Trip generation error:', err.message);
    res.status(500).json({
      success: false,
      message: `AI generation failed: ${err.message}. Please try again.`,
    });
  }
};

/**
 * GET /api/trips
 * Retrieve all trips belonging to the authenticated user only.
 */
export const getUserTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trips = await Trip.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, trips });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Fetch trips error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve trips.' });
  }
};

/**
 * GET /api/trips/:id
 * Retrieve a single trip — enforces ownership.
 */
export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user?.id });

    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found or access denied.' });
      return;
    }

    res.status(200).json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve trip.' });
  }
};

/**
 * PUT /api/trips/:id
 * Update a trip (itinerary or packingList) — enforces ownership.
 */
export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowedUpdates: Partial<{
      itinerary: IItineraryDay[];
      packingList: IPackingItem[];
    }> = {};

    // Only allow updating itinerary and packingList fields
    if (req.body.itinerary !== undefined) allowedUpdates.itinerary = req.body.itinerary;
    if (req.body.packingList !== undefined) allowedUpdates.packingList = req.body.packingList;

    if (Object.keys(allowedUpdates).length === 0) {
      res.status(400).json({ success: false, message: 'No valid fields to update.' });
      return;
    }

    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id }, // Ownership enforced
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedTrip) {
      res.status(404).json({ success: false, message: 'Trip not found or access denied.' });
      return;
    }

    res.status(200).json({ success: true, trip: updatedTrip });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Update trip error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update trip.' });
  }
};

/**
 * DELETE /api/trips/:id
 * Delete a trip — enforces ownership.
 */
export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deletedTrip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id, // Ownership enforced
    });

    if (!deletedTrip) {
      res.status(404).json({ success: false, message: 'Trip not found or access denied.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Trip deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete trip.' });
  }
};

/**
 * POST /api/trips/:id/regenerate-day
 * Regenerate a specific day's activities using Gemini with user feedback.
 */
export const regenerateDay = async (req: AuthRequest, res: Response): Promise<void> => {
  const { dayNumber, feedback } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!dayNumber || !apiKey) {
    res.status(400).json({ success: false, message: 'dayNumber is required.' });
    return;
  }

  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found.' });
      return;
    }

    const prompt = `
You are an expert travel planner. Regenerate Day ${dayNumber} of a trip to ${trip.destination}.
Budget tier: ${trip.budgetTier}. Traveler interests: ${trip.interests.join(', ')}.
${feedback ? `Special traveler request: "${feedback}"` : ''}

Return ONLY valid JSON for a single day object matching this structure:
{
  "dayNumber": ${dayNumber},
  "activities": [
    {
      "title": "Specific activity name",
      "description": "2-3 sentence practical description",
      "estimatedCostUSD": 30,
      "timeOfDay": "Morning"
    }
  ]
}

Include 3-4 activities spread across Morning, Afternoon, and Evening. Make them different from generic tourist activities.
`.trim();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
      }),
    });

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty Gemini response for day regeneration.');

    const newDay = JSON.parse(rawText);

    // Replace the specific day in the itinerary
    const updatedItinerary = trip.itinerary.map((day) =>
      day.dayNumber === dayNumber ? newDay : day
    );

    const updatedTrip = await Trip.findByIdAndUpdate(
      trip._id,
      { $set: { itinerary: updatedItinerary } },
      { new: true }
    );

    res.status(200).json({ success: true, trip: updatedTrip });
  } catch (error) {
    const err = error as Error;
    console.error('❌ Regenerate day error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to regenerate day.' });
  }
};
