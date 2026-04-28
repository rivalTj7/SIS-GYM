'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type User = { id: string; email: string; name: string };
type Profile = {
  tdee: number; goal_kcal: number; goal_prot: number; goal_carb: number;
  sex: string; age: number; weight_kg: number; height_cm: number;
  activity: string; goal: string;
} | null;

type AuthCtx = {
  user: User | null;
  profile: Profile;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, name: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMe(); }, []);

  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const { user, profile } = await res.json();
        setUser(user);
        setProfile(profile || null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<string | null> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || 'Error al iniciar sesión';
    setUser(data.user);
    await refreshProfile();
    return null;
  }

  async function register(email: string, name: string, password: string): Promise<string | null> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || 'Error al registrarse';
    setUser(data.user);
    return null;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const { profile } = await res.json();
      setProfile(profile || null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
