'use client';

import { EstimatedBudget } from '@/types';

interface BudgetBreakdownProps {
  budget: EstimatedBudget;
}

const CATEGORIES = [
  { key: 'accommodation' as const, label: 'Accommodation', emoji: '🏨', color: '#FF6B00' },
  { key: 'food'          as const, label: 'Food & Dining',  emoji: '🍽️', color: '#F59E0B' },
  { key: 'activities'   as const, label: 'Activities',      emoji: '🎯', color: '#10B981' },
  { key: 'transport'    as const, label: 'Transport',        emoji: '✈️', color: '#6366F1' },
];

export default function BudgetBreakdown({ budget }: BudgetBreakdownProps) {
  const total = budget.total || 1;

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
          💰 Budget Breakdown
        </h3>
        <p style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>Estimated costs for your trip</p>
      </div>

      {/* Total highlight */}
      <div style={{
        margin: '20px 24px 0',
        padding: '20px 24px',
        background: 'var(--color-primary-subtle)',
        border: '1px solid var(--color-primary-border)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 4 }}>
          Total Estimated Cost
        </p>
        <p style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, marginBottom: 2 }}>
          ${budget.total.toLocaleString()}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-primary)', opacity: 0.7 }}>USD</p>
      </div>

      {/* Breakdown bars */}
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {CATEGORIES.map((cat) => {
          const value = budget[cat.key];
          const pct = total > 0 ? (value / total) * 100 : 0;

          return (
            <div key={cat.key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15,
                  }}>
                    {cat.emoji}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--color-gray-700)' }}>{cat.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>${value.toLocaleString()}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-gray-400)', marginLeft: 6 }}>{Math.round(pct)}%</span>
                </div>
              </div>
              <div className="budget-bar">
                <div
                  className="budget-bar-fill"
                  style={{ width: `${pct}%`, background: cat.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
