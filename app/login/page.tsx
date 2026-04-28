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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="font-bebas" style={{ fontSize: 52, letterSpacing: 6, color: '#e8ff47', lineHeight: 1 }}>BURN GT</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#666', textTransform: 'uppercase', marginTop: 4 }}>Pro · Sistema de Entrenamiento</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 6 }}>Email</label>
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
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 6 }}>Contraseña</label>
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
            <div style={{ background: 'rgba(255,107,53,0.12)', border: '1.5px solid rgba(255,107,53,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b35' }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: '#666' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" style={{ color: '#e8ff47', fontWeight: 700, textDecoration: 'none' }}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
