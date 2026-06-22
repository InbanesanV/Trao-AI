'use client';

import { useState } from 'react';
import { PackingItem, Trip } from '@/types';
import { tripsApi } from '@/utils/api';

interface PackingListProps {
  trip: Trip;
  onUpdate: (updatedTrip: Trip) => void;
}

const CATEGORIES = ['All', 'Documents', 'Clothing', 'Gear', 'Other'] as const;

const categoryEmoji: Record<string, string> = {
  Documents: '📄',
  Clothing:  '👕',
  Gear:      '🎒',
  Other:     '📦',
};

export default function PackingList({ trip, onUpdate }: PackingListProps) {
  const [toggling, setToggling] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const packedCount = trip.packingList.filter((item) => item.isPacked).length;
  const totalCount  = trip.packingList.length;
  const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const filteredItems = activeCategory === 'All'
    ? trip.packingList
    : trip.packingList.filter((item) => item.category === activeCategory);

  const handleToggle = async (itemId: string) => {
    if (toggling) return;
    setToggling(itemId);
    const updatedPacking: PackingItem[] = trip.packingList.map((item) =>
      item._id === itemId ? { ...item, isPacked: !item.isPacked } : item
    );
    try {
      const result = await tripsApi.update(trip._id, { packingList: updatedPacking }) as { success: boolean; trip: Trip };
      if (result.success) onUpdate(result.trip);
    } finally {
      setToggling(null);
    }
  };

  const handleResetAll = async () => {
    const reset = trip.packingList.map((item) => ({ ...item, isPacked: false }));
    try {
      const result = await tripsApi.update(trip._id, { packingList: reset }) as { success: boolean; trip: Trip };
      if (result.success) onUpdate(result.trip);
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-gray-200)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 2 }}>
              🌤️ AI Weather-Aware Packing
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>
              Tailored for {trip.destination} · {trip.durationDays} days
            </p>
          </div>
          {packedCount > 0 && (
            <button
              id="reset-packing"
              type="button"
              onClick={handleResetAll}
              style={{ fontSize: 12, color: 'var(--color-gray-400)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s ease', padding: 0 }}
            >
              Reset all
            </button>
          )}
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--color-gray-600)', fontWeight: 500 }}>Packing progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-900)' }}>
              {packedCount} / {totalCount} <span style={{ fontWeight: 400, color: 'var(--color-gray-400)' }}>items</span>
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          {progressPct === 100 && (
            <p style={{ fontSize: 13, color: 'var(--color-success)', marginTop: 8, fontWeight: 600, textAlign: 'center' }}>
              ✓ All packed! Have a great trip!
            </p>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--color-gray-100)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => {
          const count = cat === 'All'
            ? trip.packingList.length
            : trip.packingList.filter((i) => i.category === cat).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              id={`packing-filter-${cat.toLowerCase()}`}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-gray-200)',
                background: isActive ? 'var(--color-primary-subtle)' : 'var(--color-white)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-gray-500)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat !== 'All' && categoryEmoji[cat] + ' '}{cat}{' '}
              <span style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-gray-400)', fontSize: 11 }}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      <div style={{ padding: '16px 24px' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-gray-400)', fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            No items in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredItems.map((item) => {
              const isPacking = toggling === item._id;
              const emoji = categoryEmoji[item.category] || '📦';
              return (
                <div
                  key={item._id}
                  onClick={() => item._id && handleToggle(item._id)}
                  className={`packing-item ${item.isPacked ? 'packed' : ''}`}
                  style={{ opacity: isPacking ? 0.6 : 1 }}
                >
                  {/* Checkbox */}
                  <div className={`packing-checkbox ${item.isPacked ? 'checked' : ''}`}>
                    {item.isPacked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  {/* Label */}
                  <span style={{
                    flex: 1,
                    fontSize: 14,
                    color: item.isPacked ? 'var(--color-gray-400)' : 'var(--color-gray-700)',
                    textDecoration: item.isPacked ? 'line-through' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.item}
                  </span>

                  {/* Category emoji */}
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{emoji}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
