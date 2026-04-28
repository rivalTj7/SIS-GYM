'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await register(email, name, password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.replace('/setup');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="font-bebas" style={{ fontSize: 52, letterSpacing: 6, color: '#e8ff47', lineHeight: 1 }}>BURN GT</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#666', textTransform: 'uppercase', marginTop: 4 }}>Crea tu cuenta</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 6 }}>Nombre</label>
            <input type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 6 }}>Contraseña</label>
            <input type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,107,53,0.12)', border: '1.5px solid rgba(255,107,53,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b35' }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: '#666' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: '#e8ff47', fontWeight: 700, textDecoration: 'none' }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
