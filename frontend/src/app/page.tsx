import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Trao AI — Intelligent Travel Planner',
  description:
    'Plan your perfect trip with Trao AI. Generate personalized day-by-day itineraries, smart budget breakdowns, hotel recommendations, and weather-aware packing lists — powered by Google Gemini AI.',
};

const features = [
  {
    icon: '🗺️',
    title: 'AI-Generated Itineraries',
    description:
      'Gemini AI crafts detailed, day-by-day travel plans tailored to your destination, interests, and budget.',
  },
  {
    icon: '💰',
    title: 'Smart Budget Planner',
    description:
      'Realistic cost breakdowns across accommodation, food, transport, and activities with tier-based pricing.',
  },
  {
    icon: '🏨',
    title: 'Hotel Recommendations',
    description:
      'Curated hotel suggestions matched to your budget tier with ratings, amenities, and nightly cost estimates.',
  },
  {
    icon: '🌤️',
    title: 'Weather-Aware Packing',
    description:
      'AI analyzes your destination climate and trip activities to generate a smart, personalized packing checklist.',
  },
  {
    icon: '✏️',
    title: 'Real-Time Editing',
    description:
      'Add, remove, or regenerate specific days on the fly. Your itinerary evolves with your plans.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description:
      'JWT-authenticated accounts with strict user data isolation. Your trips are always private and secure.',
  },
];

const stats = [
  { value: '10,000+', label: 'Trips Generated' },
  { value: '150+', label: 'Destinations' },
  { value: '< 30s', label: 'Avg Generation Time' },
  { value: '100%', label: 'Data Privacy' },
];

const steps = [
  {
    number: '1',
    title: 'Set Your Preferences',
    description: 'Enter your destination, trip duration, budget level, and travel interests.',
  },
  {
    number: '2',
    title: 'AI Builds Your Plan',
    description: 'Gemini AI generates a complete itinerary, budget breakdown, hotels, and packing list.',
  },
  {
    number: '3',
    title: 'Customize & Go',
    description: 'Edit activities, regenerate specific days, and check off your packing list.',
  },
];

const destinations = [
  { name: 'Tokyo', flag: '🇯🇵', days: 7 },
  { name: 'Bali', flag: '🇮🇩', days: 5 },
  { name: 'Paris', flag: '🇫🇷', days: 4 },
  { name: 'New York', flag: '🇺🇸', days: 6 },
  { name: 'Dubai', flag: '🇦🇪', days: 5 },
  { name: 'Singapore', flag: '🇸🇬', days: 4 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <header className="navbar">
        <div className="container" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 text-decoration-none">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
              >
                ✈️
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gray-900)' }}>
                Trao <span style={{ color: 'var(--color-primary)' }}>AI</span>
              </span>
            </Link>

            {/* Nav Actions */}
            <nav className="flex items-center gap-3">
              <Link href="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: 14 }}>
                Sign In
              </Link>
              <Link href="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>
                Get Started Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 72px', background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div className="container" style={{ textAlign: 'center' }}>

          {/* Eyebrow label */}
          <div className="pill-tag" style={{ marginBottom: 24, display: 'inline-flex' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
            Powered by Google Gemini 2.5 Flash
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: 'var(--color-gray-900)',
              lineHeight: 1.15,
              marginBottom: 20,
              letterSpacing: '-0.5px',
            }}
          >
            Plan Your Perfect Trip
            <br />
            <span className="hero-orange-line" style={{ color: 'var(--color-primary)' }}>
              with AI in Seconds
            </span>
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-gray-500)',
              maxWidth: 560,
              margin: '0 auto 36px',
              lineHeight: 1.65,
            }}
          >
            Generate personalized day-by-day itineraries, realistic budgets, hotel picks,
            and weather-aware packing lists — all in under 30 seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3" style={{ marginBottom: 48 }}>
            <Link href="/register" className="btn-primary" style={{ padding: '13px 28px', fontSize: 16 }}>
              Start Planning for Free
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: '13px 28px', fontSize: 16 }}>
              Sign In to Dashboard
            </Link>
          </div>

          {/* Destination tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {destinations.map((dest) => (
              <span
                key={dest.name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 13,
                  color: 'var(--color-gray-600)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {dest.flag} {dest.name} · {dest.days}d
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────── */}
      <section style={{ padding: '40px 0', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div style={{ fontSize: 14, color: 'var(--color-gray-500)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="section-header">
            <div className="accent-bar" style={{ marginBottom: 16 }} />
            <h2>Everything you need to travel smarter</h2>
            <p>One platform combining AI intelligence with a seamless travel planning experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card" style={{ padding: 24 }}>
                <div className="icon-box" style={{ marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--color-gray-500)', lineHeight: 1.6 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--color-gray-50)', borderTop: '1px solid var(--color-gray-200)', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div className="container">
          <div className="section-header">
            <div className="accent-bar" style={{ marginBottom: 16 }} />
            <h2>Plan a trip in 3 simple steps</h2>
            <p>No travel agents. No endless browser tabs. Just AI that does the heavy lifting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
            {steps.map((step, i) => (
              <div key={step.number} style={{ textAlign: 'center', position: 'relative' }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block"
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: 'calc(50% + 50px)',
                      right: 'calc(-50% + 50px)',
                      height: 1,
                      background: 'var(--color-gray-200)',
                    }}
                  />
                )}
                <div className="step-number">{step.number}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 10 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--color-gray-500)', lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div
            style={{
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-xl)',
              padding: '56px 40px',
              textAlign: 'center',
              maxWidth: 760,
              margin: '0 auto',
            }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 14, lineHeight: 1.25 }}>
              Ready to explore the world?
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.82)', marginBottom: 32, lineHeight: 1.6 }}>
              Join thousands of travelers who plan smarter with Trao AI.
              Free to use — no credit card required.
            </p>
            <Link
              href="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 32px',
                background: '#fff',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'box-shadow 0.15s ease',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              Start Planning for Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--color-gray-200)', padding: '28px 0' }}>
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                ✈️
              </div>
              <span style={{ fontWeight: 700, color: 'var(--color-gray-800)', fontSize: 15 }}>
                Trao <span style={{ color: 'var(--color-primary)' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>
              © {new Date().getFullYear()} Trao AI Travel Planner. Powered by Google Gemini.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
