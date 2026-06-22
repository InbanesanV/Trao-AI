'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { tripsApi } from '@/utils/api';
import { CreateTripFormData } from '@/types';

const INTEREST_OPTIONS = [
  { id: 'culture',    label: 'Culture & History',  emoji: '🏛️' },
  { id: 'food',       label: 'Food & Cuisine',      emoji: '🍜' },
  { id: 'adventure',  label: 'Adventure & Hiking',  emoji: '🏔️' },
  { id: 'beaches',    label: 'Beaches & Water',     emoji: '🏖️' },
  { id: 'shopping',   label: 'Shopping',            emoji: '🛍️' },
  { id: 'nightlife',  label: 'Nightlife',           emoji: '🌃' },
  { id: 'nature',     label: 'Nature & Wildlife',   emoji: '🦁' },
  { id: 'art',        label: 'Art & Museums',       emoji: '🎨' },
  { id: 'wellness',   label: 'Wellness & Spa',      emoji: '🧘' },
  { id: 'photography',label: 'Photography',         emoji: '📸' },
  { id: 'sports',     label: 'Sports & Fitness',    emoji: '⚽' },
  { id: 'family',     label: 'Family-Friendly',     emoji: '👨‍👩‍👧' },
];

const BUDGET_TIERS: { value: 'Low' | 'Medium' | 'High'; label: string; emoji: string; desc: string }[] = [
  { value: 'Low',    label: 'Budget',   emoji: '🎒', desc: 'Hostels, street food, public transport' },
  { value: 'Medium', label: 'Standard', emoji: '🏨', desc: 'Mid-range hotels, restaurants, mix of transport' },
  { value: 'High',   label: 'Luxury',   emoji: '✨', desc: 'Premium hotels, fine dining, private transfers' },
];

interface CreateTripFormProps {
  onSuccess?: () => void;
}

export default function CreateTripForm({ onSuccess }: CreateTripFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateTripFormData>({
    destination: '',
    durationDays: 5,
    budgetTier: 'Medium',
    interests: [],
  });

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim()) { setError('Please enter a destination.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await tripsApi.generate(formData) as { success: boolean; trip: { _id: string } };
      if (result.success) {
        if (onSuccess) onSuccess();
        else router.push('/dashboard');
      }
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Failed to generate trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Destination', 'Budget', 'Interests'];

  return (
    <div style={{ padding: '20px 24px 28px' }}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
        {stepTitles.map((label, i) => {
          const num = i + 1;
          const done = step > num;
          const active = step === num;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: done || active ? 'var(--color-primary)' : 'var(--color-gray-200)',
                  color: done || active ? '#fff' : 'var(--color-gray-500)',
                  flexShrink: 0,
                }}>
                  {done ? '✓' : num}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--color-gray-900)' : 'var(--color-gray-400)', display: step > 1 ? 'none' : undefined }}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 1, background: done ? 'var(--color-primary)' : 'var(--color-gray-200)', margin: '0 10px' }} />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleGenerate}>

        {/* ── Step 1: Destination & Duration ────────────────────────── */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 4 }}>
              Where are you going?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginBottom: 20 }}>
              Enter your destination and how long you plan to stay.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="form-label">Destination</label>
                <input
                  id="destination-input"
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g. Tokyo, Japan"
                  required
                  className="form-input"
                  style={{ fontSize: 16 }}
                />
              </div>

              <div>
                <label className="form-label">
                  Trip Duration: <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{formData.durationDays} days</span>
                </label>
                <input
                  id="duration-slider"
                  type="range"
                  min={1}
                  max={21}
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-gray-400)', marginTop: 4 }}>
                  <span>1 day</span><span>7</span><span>14</span><span>21 days</span>
                </div>
              </div>
            </div>

            {error && <p style={{ color: 'var(--color-error)', fontSize: 13, marginTop: 12 }}>{error}</p>}

            <button
              id="step1-next"
              type="button"
              onClick={() => {
                if (!formData.destination.trim()) { setError('Please enter a destination.'); return; }
                setError(''); setStep(2);
              }}
              className="btn-primary"
              style={{ width: '100%', marginTop: 24, padding: '12px' }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Budget Tier ─────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 4 }}>
              What&apos;s your budget?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginBottom: 20 }}>
              AI will tailor costs and hotel recommendations to your selected tier.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BUDGET_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  id={`budget-${tier.value.toLowerCase()}`}
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetTier: tier.value })}
                  className={`budget-tier-card ${formData.budgetTier === tier.value ? 'selected' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{tier.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-gray-900)', marginBottom: 2 }}>{tier.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>{tier.desc}</div>
                    </div>
                    {formData.budgetTier === tier.value && (
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', flexShrink: 0,
                      }}>✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                ← Back
              </button>
              <button id="step2-next" type="button" onClick={() => setStep(3)} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Interests & Generate ───────────────────────── */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 4 }}>
              What are your interests?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginBottom: 20 }}>
              Select all that apply — AI uses these to personalize your activities. (Optional)
            </p>

            <div className="grid grid-cols-2 gap-2" style={{ marginBottom: 20 }}>
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest.id}
                  id={`interest-${interest.id}`}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`interest-chip ${formData.interests.includes(interest.id) ? 'selected' : ''}`}
                >
                  <span>{interest.emoji}</span>
                  <span>{interest.label}</span>
                </button>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              background: 'var(--color-gray-50)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: 20,
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Trip Summary</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p style={{ fontSize: 14, color: 'var(--color-gray-700)' }}>📍 <strong>{formData.destination}</strong></p>
                <p style={{ fontSize: 14, color: 'var(--color-gray-700)' }}>📅 <strong>{formData.durationDays} days</strong></p>
                <p style={{ fontSize: 14, color: 'var(--color-gray-700)' }}>💰 <strong>{formData.budgetTier} budget</strong></p>
                {formData.interests.length > 0 && (
                  <p style={{ fontSize: 14, color: 'var(--color-gray-700)' }}>🎯 <strong>{formData.interests.join(', ')}</strong></p>
                )}
              </div>
            </div>

            {error && (
              <div className="alert-error" style={{ marginBottom: 16 }}>
                <span>⚠</span><span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                ← Back
              </button>
              <button
                id="generate-trip"
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ flex: 2, padding: '12px' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span className="spinner" />
                    Generating itinerary...
                  </span>
                ) : 'Generate My Trip'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
