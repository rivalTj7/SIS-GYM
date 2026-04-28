'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

const GOAL_LABELS: Record<string, string> = {
  def: 'Quemar grasa', mant: 'Mantener', vol: 'Ganar músculo', agr: 'Déficit agresivo',
};

const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const GREETINGS = ['Buenas noches', 'Buenos días', 'Buenos días', 'Buen día', 'Buenas tardes', 'Buenas tardes', 'Buenas noches'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return GREETINGS[0];
  if (h < 12) return GREETINGS[1];
  if (h < 14) return GREETINGS[3];
  if (h < 20) return GREETINGS[4];
  return GREETINGS[0];
}

export default function DashboardPage() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<{ streak: number; nutritionStats: { avg_kcal: number } | null; weightStats: { current: number; change: number } | null } | null>(null);
  const [todayNutrition, setTodayNutrition] = useState<{ totals: { kcal: number; protein_g: number } } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/progress').then(r => r.json()).then(setStats).catch(() => {});
      const today = new Date().toISOString().slice(0, 10);
      fetch(`/api/nutrition?date=${today}`).then(r => r.json()).then(setTodayNutrition).catch(() => {});
    }
  }, [user]);

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  const today = new Date();
  const dayName = DAY_NAMES[today.getDay()];
  const dateStr = today.toLocaleDateString('es-GT', { day: 'numeric', month: 'long' });

  const kcalToday = todayNutrition?.totals?.kcal ?? 0;
  const protToday = todayNutrition?.totals?.protein_g ?? 0;
  const goalKcal = profile?.goal_kcal ?? 0;
  const goalProt = profile?.goal_prot ?? 0;
  const kcalPct = goalKcal > 0 ? Math.min(100, Math.round((kcalToday / goalKcal) * 100)) : 0;
  const protPct = goalProt > 0 ? Math.min(100, Math.round((protToday / goalProt) * 100)) : 0;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: '#666', fontWeight: 600, letterSpacing: 1 }}>{getGreeting()},</div>
          <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 2, color: '#f2f0ea', lineHeight: 1.1, marginTop: 2 }}>{user.name.split(' ')[0]}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{dayName} · {dateStr}</div>
        </div>
        <button onClick={async () => { await logout(); router.replace('/login'); }} style={{
          background: 'transparent', border: '1.5px solid #2a2a2a', borderRadius: 8,
          padding: '6px 12px', fontSize: 11, color: '#666', cursor: 'pointer', fontWeight: 700, letterSpacing: 1,
        }}>
          SALIR
        </button>
      </div>

      {/* Streak */}
      {stats && (
        <div style={{ margin: '20px 20px 0' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="font-bebas" style={{ fontSize: 48, color: '#e8ff47', lineHeight: 1 }}>{stats.streak}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f2f0ea' }}>Días de racha</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>¡Sigue así! 🔥</div>
            </div>
          </div>
        </div>
      )}

      {/* Perfil / TDEE */}
      {profile ? (
        <div style={{ margin: '16px 20px 0' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Objetivo</div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e8ff47' }}>{GOAL_LABELS[profile.goal] ?? profile.goal}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>TDEE: {profile.tdee} kcal · Objetivo: {profile.goal_kcal} kcal</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#666' }}>Proteína</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f2f0ea' }}>{profile.goal_prot}g</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ margin: '16px 20px 0' }}>
          <Link href="/setup" style={{ display: 'block', textDecoration: 'none' }}>
            <div className="card" style={{ border: '1.5px solid rgba(232,255,71,0.3)', background: 'rgba(232,255,71,0.04)', textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8ff47' }}>Configura tu perfil →</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Calcula tu TDEE y macros personalizados</div>
            </div>
          </Link>
        </div>
      )}

      {/* Nutrición de hoy */}
      <div style={{ margin: '16px 20px 0' }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Nutrición de hoy</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="card">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#666', textTransform: 'uppercase' }}>Calorías</div>
            <div className="font-bebas" style={{ fontSize: 32, color: '#e8ff47', marginTop: 4 }}>{kcalToday}</div>
            {goalKcal > 0 && <div style={{ fontSize: 11, color: '#666' }}>de {goalKcal} kcal</div>}
            <div style={{ marginTop: 8, height: 4, background: '#2a2a2a', borderRadius: 4 }}>
              <div style={{ height: '100%', background: '#e8ff47', width: `${kcalPct}%`, borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#666', textTransform: 'uppercase' }}>Proteína</div>
            <div className="font-bebas" style={{ fontSize: 32, color: '#ff6b35', marginTop: 4 }}>{Math.round(protToday)}g</div>
            {goalProt > 0 && <div style={{ fontSize: 11, color: '#666' }}>de {goalProt}g</div>}
            <div style={{ marginTop: 8, height: 4, background: '#2a2a2a', borderRadius: 4 }}>
              <div style={{ height: '100%', background: '#ff6b35', width: `${protPct}%`, borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Peso */}
      {stats?.weightStats && (
        <div style={{ margin: '16px 20px 0' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Peso</div>
          <div className="card" style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#666', textTransform: 'uppercase' }}>Actual</div>
              <div className="font-bebas" style={{ fontSize: 32, color: '#f2f0ea' }}>{stats.weightStats.current}kg</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#666', textTransform: 'uppercase' }}>Cambio</div>
              <div className="font-bebas" style={{ fontSize: 32, color: stats.weightStats.change <= 0 ? '#e8ff47' : '#ff6b35' }}>
                {stats.weightStats.change > 0 ? '+' : ''}{stats.weightStats.change}kg
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ margin: '20px 20px 0' }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Acciones rápidas</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Link href="/workout" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: '20px 12px', border: '1.5px solid rgba(232,255,71,0.2)' }}>
              <div style={{ fontSize: 28 }}>🏋️</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8ff47', marginTop: 6 }}>Entrenar</div>
            </div>
          </Link>
          <Link href="/nutrition" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: '20px 12px', border: '1.5px solid rgba(255,107,53,0.2)' }}>
              <div style={{ fontSize: 28 }}>🥗</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ff6b35', marginTop: 6 }}>Registrar comida</div>
            </div>
          </Link>
          <Link href="/progress" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: '20px 12px', border: '1.5px solid rgba(77,170,255,0.2)' }}>
              <div style={{ fontSize: 28 }}>📊</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4daaff', marginTop: 6 }}>Ver progreso</div>
            </div>
          </Link>
          <Link href="/setup" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ fontSize: 28 }}>⚙️</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#666', marginTop: 6 }}>Ajustar perfil</div>
            </div>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
