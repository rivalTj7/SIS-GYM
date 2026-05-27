'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, profile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await login(email, password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.replace(profile ? '/dashboard' : '/setup');
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            background: 'rgba(200,255,0,0.1)',
            border: '1.5px solid rgba(200,255,0,0.2)',
            borderRadius: 18,
            marginBottom: 20,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#c8ff00">
              <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
            </svg>
          </div>
          <div className="font-bebas" style={{
            fontSize: 56,
            letterSpacing: 6,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #c8ff00, #ffee00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            BURN GT
          </div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            marginTop: 6,
          }}>
            Sistema de Entrenamiento Pro
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '32px 28px',
        }}>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#f2f0ea',
            marginBottom: 24,
          }}>
            Bienvenido de vuelta
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                display: 'block',
                marginBottom: 8,
              }}>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                display: 'block',
                marginBottom: 8,
              }}>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,77,77,0.08)',
                border: '1.5px solid rgba(255,77,77,0.2)',
                borderRadius: 12,
                padding: '11px 14px',
                fontSize: 13,
                color: '#ff6b6b',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 14,
          color: 'rgba(255,255,255,0.35)',
        }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" style={{
            color: '#c8ff00',
            fontWeight: 700,
            textDecoration: 'none',
          }}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
