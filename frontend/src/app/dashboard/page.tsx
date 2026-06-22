'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trip } from '@/types';
import { tripsApi, removeToken, getUser } from '@/utils/api';
import ItineraryCard from '@/components/ItineraryCard';
import PackingList from '@/components/PackingList';
import BudgetBreakdown from '@/components/BudgetBreakdown';
import HotelCard from '@/components/HotelCard';
import CreateTripForm from '@/components/CreateTripForm';

type ActiveTab = 'itinerary' | 'packing' | 'budget' | 'hotels';

const TABS: { id: ActiveTab; label: string; icon: string }[] = [
  { id: 'itinerary', label: 'Itinerary', icon: '🗓' },
  { id: 'packing',   label: 'Packing',   icon: '🧳' },
  { id: 'budget',    label: 'Budget',    icon: '💰' },
  { id: 'hotels',    label: 'Hotels',    icon: '🏨' },
];

const budgetTierStyle = (tier: string) => {
  if (tier === 'Low')  return { background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid #A7F3D0' };
  if (tier === 'High') return { background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' };
  return { background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-border)' };
};

export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('itinerary');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      const result = await tripsApi.getAll() as { success: boolean; trips: Trip[] };
      if (result.success) {
        setTrips(result.trips);
        if (result.trips.length > 0 && !selectedTrip) {
          setSelectedTrip(result.trips[0]);
        }
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('trao_token') : null;
    if (!token) { router.push('/login'); return; }
    const userData = getUser();
    if (userData) setUser(userData);
    fetchTrips();
  }, [fetchTrips, router]);

  const handleSignOut = () => { removeToken(); router.push('/login'); };

  const handleTripUpdate = (updatedTrip: Trip) => {
    setSelectedTrip(updatedTrip);
    setTrips((prev) => prev.map((t) => (t._id === updatedTrip._id ? updatedTrip : t)));
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    setDeleting(tripId);
    try {
      await tripsApi.delete(tripId);
      const remaining = trips.filter((t) => t._id !== tripId);
      setTrips(remaining);
      if (selectedTrip?._id === tripId) setSelectedTrip(remaining.length > 0 ? remaining[0] : null);
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateSuccess = async () => {
    setShowCreateForm(false);
    setLoading(true);
    await fetchTrips();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-gray-50)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-orange" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-gray-500)', fontSize: 15 }}>Loading your travel plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-gray-50)' }}>

      {/* ── Top Navigation ─────────────────────────────────────────────── */}
      <header className="navbar">
        <div className="container" style={{ paddingTop: 12, paddingBottom: 12 }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                ✈️
              </div>
              <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-gray-900)' }}>
                Trao <span style={{ color: 'var(--color-primary)' }}>AI</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2" style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'var(--color-primary-subtle)',
                    border: '1.5px solid var(--color-primary-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, color: 'var(--color-primary)',
                  }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>{user.name}</span>
                </div>
              )}
              <button id="sign-out-btn" onClick={handleSignOut} className="btn-danger" style={{ fontSize: 13, padding: '7px 14px' }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 4 }}>
              My Travel Plans
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-gray-500)' }}>
              {trips.length === 0 ? 'No trips yet' : `${trips.length} ${trips.length === 1 ? 'itinerary' : 'itineraries'} saved`}
            </p>
          </div>
          <button
            id="create-trip-btn"
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: 14 }}
          >
            + New Trip
          </button>
        </div>

        {/* ── Create Trip Modal ────────────────────────────────────────── */}
        {showCreateForm && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreateForm(false); }}
          >
            <div
              style={{
                background: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                width: '100%',
                maxWidth: 600,
                maxHeight: '92vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gray-900)' }}>Create New Trip</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--color-gray-400)', lineHeight: 1, padding: 4 }}
                >
                  ×
                </button>
              </div>
              <CreateTripForm onSuccess={handleCreateSuccess} />
            </div>
          </div>
        )}

        {/* ── Empty State ──────────────────────────────────────────────── */}
        {trips.length === 0 ? (
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xl)',
            padding: '80px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✈️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 10 }}>
              No trips yet
            </h2>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 15, marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
              Generate your first AI-powered travel itinerary. Just tell us where you want to go.
            </p>
            <button
              id="empty-create-btn"
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: 15 }}
            >
              Generate My First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* ── Sidebar: Trip List ─────────────────────────────────── */}
            <div className="lg:col-span-1">
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                Your Trips
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trips.map((trip) => (
                  <div key={trip._id} style={{ position: 'relative' }} className="group">
                    <button
                      id={`trip-select-${trip._id}`}
                      onClick={() => { setSelectedTrip(trip); setActiveTab('itinerary'); }}
                      className={`trip-card ${selectedTrip?._id === trip._id ? 'active' : ''}`}
                    >
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-gray-900)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trip.destination}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 8 }}>
                        {trip.durationDays} days
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge" style={{ ...budgetTierStyle(trip.budgetTier), padding: '2px 8px', fontSize: 10 }}>
                          {trip.budgetTier}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                          ${trip.estimatedBudget.total.toLocaleString()}
                        </span>
                      </div>
                    </button>
                    {/* Delete on hover */}
                    <button
                      onClick={() => handleDeleteTrip(trip._id)}
                      disabled={deleting === trip._id}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 24, height: 24,
                        borderRadius: 6,
                        background: 'var(--color-error-bg)',
                        border: '1px solid #FECACA',
                        color: 'var(--color-error)',
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: deleting === trip._id ? 1 : 0,
                        transition: 'opacity 0.15s ease',
                      }}
                      className="group-hover:!opacity-100"
                      aria-label="Delete trip"
                    >
                      {deleting === trip._id ? '…' : '×'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Main Content ────────────────────────────────────────── */}
            {selectedTrip ? (
              <div className="lg:col-span-3" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Trip summary card */}
                <div style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
                        {selectedTrip.destination}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3">
                        <span style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
                          📅 {selectedTrip.durationDays} days
                        </span>
                        <span className="badge" style={budgetTierStyle(selectedTrip.budgetTier)}>
                          {selectedTrip.budgetTier} Budget
                        </span>
                        {selectedTrip.interests.length > 0 && (
                          <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>
                            {selectedTrip.interests.slice(0, 3).join(', ')}
                            {selectedTrip.interests.length > 3 && ` +${selectedTrip.interests.length - 3}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Total Budget</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        ${selectedTrip.estimatedBudget.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tab bar */}
                <div className="tab-bar">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      <span className="hidden sm:inline">{tab.icon} </span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div>
                  {activeTab === 'itinerary' && <ItineraryCard trip={selectedTrip} onUpdate={handleTripUpdate} />}
                  {activeTab === 'packing'   && <PackingList trip={selectedTrip} onUpdate={handleTripUpdate} />}
                  {activeTab === 'budget'    && <BudgetBreakdown budget={selectedTrip.estimatedBudget} />}
                  {activeTab === 'hotels'    && <HotelCard hotels={selectedTrip.hotels} />}
                </div>
              </div>
            ) : (
              <div className="lg:col-span-3" style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 60, textAlign: 'center', boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
                <p style={{ color: 'var(--color-gray-500)', fontSize: 15 }}>
                  Select a trip from the list to view its details.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
