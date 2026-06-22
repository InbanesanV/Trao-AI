'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, setToken, setUser } from '@/utils/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getStrength = () => {
    if (!password) return { score: 0, label: '', cls: '' };
    if (password.length < 6) return { score: 1, label: 'Weak', cls: 'strength-weak' };
    if (password.length < 10) return { score: 2, label: 'Fair', cls: 'strength-fair' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { score: 4, label: 'Strong', cls: 'strength-strong' };
    return { score: 3, label: 'Good', cls: 'strength-good' };
  };

  const strength = getStrength();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const response = await authApi.register({ name, email, password }) as {
        success: boolean;
        token: string;
        user: { id: string; name: string; email: string };
        message: string;
      };
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        router.push('/dashboard');
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-gray-50)' }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: 420,
          flexShrink: 0,
          background: 'var(--color-primary)',
          padding: '48px 48px 40px',
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            ✈️
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Trao AI</span>
        </Link>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 16 }}>
            Start planning<br />smarter trips today
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.65 }}>
            Free to use. No credit card required. Generate your first AI itinerary in under 30 seconds.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['✓  Day-by-day itinerary generation', '✓  Smart budget breakdown', '✓  Weather-aware packing list', '✓  Hotel recommendations'].map((f) => (
            <p key={f} style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{f}</p>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                ✈️
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gray-900)' }}>
                Trao <span style={{ color: 'var(--color-primary)' }}>AI</span>
              </span>
            </Link>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 6 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-gray-500)' }}>
              Start planning AI-powered trips for free.
            </p>
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: 18 }}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="name" className="form-label">Full Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your full name" required autoComplete="name" className="form-input" />
            </div>

            <div>
              <label htmlFor="register-email" className="form-label">Email Address</label>
              <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" className="form-input" />
            </div>

            <div>
              <label htmlFor="register-password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="register-password" type={showPassword ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters" required autoComplete="new-password"
                  className="form-input" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', fontSize: 16, padding: 0 }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`strength-bar ${i <= strength.score ? strength.cls : ''}`} />
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                    Strength: <strong>{strength.label}</strong>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
              <input id="confirm-password" type={showPassword ? 'text' : 'password'}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password" required autoComplete="new-password"
                className="form-input"
                style={{
                  borderColor: confirmPassword
                    ? confirmPassword === password ? 'var(--color-success)' : 'var(--color-error)'
                    : undefined,
                }} />
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4 }}>Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 4 }}>✓ Passwords match</p>
              )}
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="spinner" />
                  Creating account...
                </span>
              ) : 'Create Free Account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--color-gray-500)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 20 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>

          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--color-gray-400)' }}>
            By creating an account, you agree to our Privacy Policy and Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
