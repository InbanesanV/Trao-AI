'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, setToken, setUser } from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authApi.login({ email, password }) as {
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
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-gray-50)' }}>
      {/* Left panel — branding */}
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
            Your AI-Powered<br />Travel Companion
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.65 }}>
            Generate day-by-day itineraries, hotel recommendations, budget plans, and smart packing lists in seconds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Trips Generated', value: '10K+' },
            { label: 'Destinations', value: '150+' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
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

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-gray-500)' }}>
              Sign in to access your travel dashboard.
            </p>
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: 20 }}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  className="form-input"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-gray-400)',
                    fontSize: 16,
                    padding: 0,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--color-gray-500)', borderTop: '1px solid var(--color-gray-200)', paddingTop: 20 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--color-gray-400)' }}>
            By signing in, you agree to our Privacy Policy and Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
