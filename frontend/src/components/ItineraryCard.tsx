'use client';

import { useState } from 'react';
import { ItineraryDay, Trip } from '@/types';
import { tripsApi } from '@/utils/api';

interface ItineraryCardProps {
  trip: Trip;
  onUpdate: (updatedTrip: Trip) => void;
}

const timeConfig: Record<string, { badge: string; label: string }> = {
  Morning:   { badge: 'badge-morning',   label: 'Morning' },
  Afternoon: { badge: 'badge-afternoon', label: 'Afternoon' },
  Evening:   { badge: 'badge-evening',   label: 'Evening' },
};

export default function ItineraryCard({ trip, onUpdate }: ItineraryCardProps) {
  const [newActivity, setNewActivity] = useState('');
  const [targetDay, setTargetDay] = useState<number | null>(null);
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [regenFeedback, setRegenFeedback] = useState('');
  const [regenTargetDay, setRegenTargetDay] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleAddActivity = async (dayNumber: number) => {
    if (!newActivity.trim()) return;
    setAddingTo(dayNumber);
    setError('');
    const updatedItinerary: ItineraryDay[] = trip.itinerary.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: [
            ...day.activities,
            { title: newActivity.trim(), description: 'Added by traveler', estimatedCostUSD: 0, timeOfDay: 'Afternoon' as const },
          ],
        };
      }
      return day;
    });
    try {
      const result = await tripsApi.update(trip._id, { itinerary: updatedItinerary }) as { success: boolean; trip: Trip };
      if (result.success) { onUpdate(result.trip); setNewActivity(''); setTargetDay(null); }
    } catch (err) {
      setError((err as Error).message || 'Failed to add activity.');
    } finally {
      setAddingTo(null);
    }
  };

  const handleRemoveActivity = async (dayNumber: number, activityIndex: number) => {
    const updatedItinerary: ItineraryDay[] = trip.itinerary.map((day) => {
      if (day.dayNumber === dayNumber) {
        return { ...day, activities: day.activities.filter((_, i) => i !== activityIndex) };
      }
      return day;
    });
    try {
      const result = await tripsApi.update(trip._id, { itinerary: updatedItinerary }) as { success: boolean; trip: Trip };
      if (result.success) onUpdate(result.trip);
    } catch (err) {
      setError((err as Error).message || 'Failed to remove activity.');
    }
  };

  const handleRegenerateDay = async (dayNumber: number) => {
    setRegenerating(dayNumber);
    setError('');
    try {
      const result = await tripsApi.regenerateDay(trip._id, dayNumber, regenFeedback) as { success: boolean; trip: Trip };
      if (result.success) { onUpdate(result.trip); setRegenTargetDay(null); setRegenFeedback(''); }
    } catch (err) {
      setError((err as Error).message || 'Failed to regenerate day.');
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && (
        <div className="alert-error">
          <span>⚠</span><span>{error}</span>
        </div>
      )}

      {trip.itinerary.map((day) => (
        <div key={day.dayNumber} style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Day header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-gray-100)',
            background: 'var(--color-gray-50)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--color-primary)',
                color: '#fff', fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {day.dayNumber}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-gray-900)', margin: 0 }}>Day {day.dayNumber}</p>
                <p style={{ fontSize: 12, color: 'var(--color-gray-400)', margin: 0 }}>{day.activities.length} activities</p>
              </div>
            </div>
            <button
              id={`regen-day-${day.dayNumber}`}
              type="button"
              onClick={() => setRegenTargetDay(regenTargetDay === day.dayNumber ? null : day.dayNumber)}
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              ↻ Regenerate
            </button>
          </div>

          {/* Regenerate panel */}
          {regenTargetDay === day.dayNumber && (
            <div style={{
              padding: '14px 20px',
              background: 'var(--color-primary-subtle)',
              borderBottom: '1px solid var(--color-primary-border)',
            }}>
              <p style={{ fontSize: 13, color: 'var(--color-gray-600)', marginBottom: 10, fontWeight: 500 }}>
                Optional: Tell AI what to change for Day {day.dayNumber}
              </p>
              <input
                type="text"
                value={regenFeedback}
                onChange={(e) => setRegenFeedback(e.target.value)}
                placeholder="e.g. More outdoor activities, skip museums"
                className="form-input"
                style={{ fontSize: 13, marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  id={`confirm-regen-${day.dayNumber}`}
                  type="button"
                  onClick={() => handleRegenerateDay(day.dayNumber)}
                  disabled={regenerating === day.dayNumber}
                  className="btn-primary"
                  style={{ flex: 1, padding: '9px', fontSize: 13 }}
                >
                  {regenerating === day.dayNumber ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <span className="spinner" />Regenerating...
                    </span>
                  ) : 'Generate New Day'}
                </button>
                <button
                  type="button"
                  onClick={() => { setRegenTargetDay(null); setRegenFeedback(''); }}
                  className="btn-secondary"
                  style={{ padding: '9px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Activities */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {day.activities.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--color-gray-400)', padding: '8px 0' }}>No activities yet. Add one below.</p>
            ) : (
              day.activities.map((activity, index) => {
                const tc = timeConfig[activity.timeOfDay] || timeConfig['Afternoon'];
                return (
                  <div key={index} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 14px',
                    border: '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-white)',
                  }}
                  className="group"
                  >
                    <div style={{
                      width: 4, borderRadius: 4, alignSelf: 'stretch', flexShrink: 0,
                      background: activity.timeOfDay === 'Morning' ? '#F59E0B'
                        : activity.timeOfDay === 'Afternoon' ? '#3B82F6'
                        : '#8B5CF6',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-gray-900)' }}>{activity.title}</span>
                        <span className={`badge ${tc.badge}`}>{tc.label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--color-gray-500)', lineHeight: 1.5, margin: 0 }}>{activity.description}</p>
                      {activity.estimatedCostUSD > 0 && (
                        <p style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 4, fontWeight: 600 }}>
                          ~${activity.estimatedCostUSD} USD
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(day.dayNumber, index)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-gray-300)', fontSize: 18, lineHeight: 1,
                        padding: 2, flexShrink: 0,
                        transition: 'color 0.15s ease',
                      }}
                      className="group-hover:!text-red-400"
                      aria-label="Remove activity"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}

            {/* Add activity row */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input
                id={`add-activity-day-${day.dayNumber}`}
                type="text"
                placeholder={`Add activity to Day ${day.dayNumber}...`}
                value={targetDay === day.dayNumber ? newActivity : ''}
                onChange={(e) => { setTargetDay(day.dayNumber); setNewActivity(e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddActivity(day.dayNumber); } }}
                className="form-input"
                style={{ fontSize: 13 }}
              />
              <button
                id={`add-activity-btn-${day.dayNumber}`}
                type="button"
                onClick={() => handleAddActivity(day.dayNumber)}
                disabled={addingTo === day.dayNumber}
                className="btn-primary"
                style={{ padding: '10px 16px', fontSize: 13, flexShrink: 0 }}
              >
                {addingTo === day.dayNumber ? '...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
