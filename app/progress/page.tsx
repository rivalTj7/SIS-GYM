'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

type WeightLog = { logged_at: string; weight_kg: number };
type Session = { week: string; completed: number; total: number; avg_duration: number | null };
type PR = { exercise_name: string; best_weight: number | null; reps: number | null; created_at: string };

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [weightStats, setWeightStats] = useState<{ current: number; start: number; change: number; lowest: number; highest: number } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Log weight
  const [weightInput, setWeightInput] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightError, setWeightError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadData() {
    setDataLoading(true);
    try {
      const res = await fetch('/api/progress');
      const data = await res.json();
      setWeights((data.weights ?? []).slice(0, 20).reverse());
      setSessions(data.sessions ?? []);
      setPrs(data.prs ?? []);
      setWeightStats(data.weightStats ?? null);
    } catch {}
    setDataLoading(false);
  }

  async function saveWeight(e: React.FormEvent) {
    e.preventDefault();
    setWeightError('');
    setSavingWeight(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: Number(weightInput), notes: weightNote || undefined }),
      });
      if (!res.ok) throw new Error();
      setWeightInput('');
      setWeightNote('');
      await loadData();
    } catch {
      setWeightError('No se pudo guardar el peso');
    }
    setSavingWeight(false);
  }

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  const maxWeight = weights.length > 0 ? Math.max(...weights.map(w => Number(w.weight_kg))) : 100;
  const minWeight = weights.length > 0 ? Math.min(...weights.map(w => Number(w.weight_kg))) : 50;
  const weightRange = maxWeight - minWeight || 1;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 0' }}>
        <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 4, color: '#e8ff47' }}>PROGRESO</div>
      </div>

      {/* Weight stats */}
      {weightStats && (
        <div style={{ margin: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Actual', value: `${weightStats.current}kg`, color: '#f2f0ea' },
            { label: 'Cambio', value: `${weightStats.change > 0 ? '+' : ''}${weightStats.change}kg`, color: weightStats.change <= 0 ? '#e8ff47' : '#ff6b35' },
            { label: 'Mínimo', value: `${weightStats.lowest}kg`, color: '#4daaff' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#666', textTransform: 'uppercase' }}>{s.label}</div>
              <div className="font-bebas" style={{ fontSize: 24, color: s.color, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Weight chart */}
      {weights.length > 0 && (
        <div style={{ margin: '16px 20px 0' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Historial de peso (últimas {weights.length} entradas)</div>
          <div className="card" style={{ padding: '16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {weights.map((w, i) => {
                const h = Math.max(8, ((Number(w.weight_kg) - minWeight) / weightRange) * 68 + 12);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', background: '#e8ff47', borderRadius: '3px 3px 0 0', height: h, opacity: i === weights.length - 1 ? 1 : 0.5, transition: 'height 0.4s' }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#444' }}>
              <span>{weights[0]?.logged_at?.slice(5)}</span>
              <span>{weights[weights.length - 1]?.logged_at?.slice(5)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Log weight */}
      <div style={{ margin: '16px 20px 0' }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Registrar peso</div>
        <form onSubmit={saveWeight} style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input type="number" placeholder="Peso (kg) *" value={weightInput} onChange={e => setWeightInput(e.target.value)} required min={30} max={300} step={0.1} />
            <input type="text" placeholder="Nota (opcional)" value={weightNote} onChange={e => setWeightNote(e.target.value)} />
          </div>
          {weightError && <div style={{ fontSize: 12, color: '#ff6b35' }}>{weightError}</div>}
          <button className="btn-primary" type="submit" disabled={savingWeight}>
            {savingWeight ? 'GUARDANDO...' : 'GUARDAR PESO'}
          </button>
        </form>
      </div>

      {/* Weekly sessions */}
      {sessions.length > 0 && (
        <div style={{ margin: '16px 20px 0' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Entrenamientos semanales</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.slice(0, 6).map((s, i) => {
              const pct = s.total > 0 ? Math.round((Number(s.completed) / Number(s.total)) * 100) : 0;
              const weekStr = new Date(s.week).toLocaleDateString('es', { month: 'short', day: 'numeric' });
              return (
                <div key={i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Sem. {weekStr}</span>
                    <span style={{ fontSize: 13, color: '#e8ff47', fontWeight: 700 }}>{Number(s.completed)}/{Number(s.total)}</span>
                  </div>
                  <div style={{ height: 4, background: '#2a2a2a', borderRadius: 4 }}>
                    <div style={{ height: '100%', background: '#e8ff47', width: `${pct}%`, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRs */}
      {prs.length > 0 && (
        <div style={{ margin: '16px 20px 0' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Records personales 🏆</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {prs.map((pr, i) => (
              <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{pr.exercise_name}</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{new Date(pr.created_at).toLocaleDateString('es')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {pr.best_weight && <div className="font-bebas" style={{ fontSize: 22, color: '#e8ff47' }}>{pr.best_weight}kg</div>}
                  {pr.reps && <div style={{ fontSize: 11, color: '#666' }}>{pr.reps} reps</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dataLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
      )}

      <BottomNav />
    </div>
  );
}
