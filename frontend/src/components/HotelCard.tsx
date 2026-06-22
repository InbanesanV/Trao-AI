'use client';

import { Hotel } from '@/types';

interface HotelCardProps {
  hotels: Hotel[];
}

const tierConfig: Record<string, { bg: string; color: string; border: string }> = {
  Budget:   { bg: '#F0FDF4', color: '#059669', border: '#BBF7D0' },
  Low:      { bg: '#F0FDF4', color: '#059669', border: '#BBF7D0' },
  Standard: { bg: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: 'var(--color-primary-border)' },
  Medium:   { bg: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: 'var(--color-primary-border)' },
  High:     { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  Luxury:   { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  Premium:  { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
};

export default function HotelCard({ hotels }: HotelCardProps) {
  if (!hotels || hotels.length === 0) return null;

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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 2 }}>
          🏨 Recommended Hotels
        </h3>
        <p style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>AI-curated stays matched to your budget</p>
      </div>

      {/* Hotel list */}
      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {hotels.map((hotel, index) => {
          const tc = tierConfig[hotel.tier] || tierConfig['Standard'];
          const stars = parseFloat(hotel.rating) || 0;
          const fullStars = Math.floor(stars);

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-md)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              className="card"
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-gray-900)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {hotel.name}
                  </h4>
                  {/* Stars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {Array.from({ length: fullStars }).map((_, i) => (
                      <span key={i} style={{ color: '#F59E0B', fontSize: 13 }}>★</span>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - fullStars) }).map((_, i) => (
                      <span key={i} style={{ color: 'var(--color-gray-200)', fontSize: 13 }}>★</span>
                    ))}
                    <span style={{ fontSize: 12, color: 'var(--color-gray-400)', marginLeft: 4 }}>{hotel.rating}</span>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
                    ${hotel.estimatedCostNightUSD}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>/ night</p>
                </div>
              </div>

              {/* Bottom row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase',
                  background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                }}>
                  {hotel.tier}
                </span>

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {hotel.amenities.slice(0, 3).map((amenity, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 11, padding: '2px 8px',
                          background: 'var(--color-gray-100)', color: 'var(--color-gray-500)',
                          borderRadius: 'var(--radius-full)', border: '1px solid var(--color-gray-200)',
                        }}
                      >
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>+{hotel.amenities.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
