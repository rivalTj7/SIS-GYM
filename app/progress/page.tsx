'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

type WeightLog = { logged_at: string; weight_kg: number };
type Session = { week: string; completed: number; total: number; avg_duration: number | null };
type PR = { exercise_name: string; best_weight: number | null; reps: number | null; created_at: string };
type Measurements = { waist: string; chest: string; hip: string; arm: string; thigh: string; date: string };

const EMPTY_M: Measurements = { waist: '', chest: '', hip: '', arm: '', thigh: '', date: new Date().toISOString().slice(0, 10) };

export default function ProgressPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [weightStats, setWeightStats] = useState<{ current: number; start: number; change: number; lowest: number; highest: number } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Weight log
  const [weightInput, setWeightInput] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightError, setWeightError] = useState('');

  // Body measurements (localStorage)
  const [measurements, setMeasurements] = useState<Measurements[]>([]);
  const [showMeasureForm, setShowMeasureForm] = useState(false);
  const [mForm, setMForm] = useState<Measurements>(EMPTY_M);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
      try {
        const raw = localStorage.getItem('burngt_measurements');
        if (raw) setMeasurements(JSON.parse(raw));
      } catch {}
    }
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

  function saveMeasurements(e: React.FormEvent) {
    e.preventDefault();
    const next = [mForm, ...measurements].slice(0, 20);
    setMeasurements(next);
    try { localStorage.setItem('burngt_measurements', JSON.stringify(next)); } catch {}
    setMForm(EMPTY_M);
    setShowMeasureForm(false);
  }

  if (loading || !user) {
    return <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center"><div className="spinner" /></div>;
  }

  const maxWeight = weights.length > 0 ? Math.max(...weights.map(w => Number(w.weight_kg))) : 100;
  const minWeight = weights.length > 0 ? Math.min(...weights.map(w => Number(w.weight_kg))) : 50;
  const weightRange = maxWeight - minWeight || 1;
  const proteinTarget = profile?.weight_kg ? Math.round(profile.weight_kg * 2) : null;
  const latest = measurements[0];

  return (
    <div className="page-root">
      {/* Header */}
      <div style={{ padding: '28px 20px 0' }}>
        <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 4, color: '#e8ff47' }}>COMPOSICIÓN</div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 2, fontWeight: 600, letterSpacing: 1 }}>
          RECOMPOSICIÓN CORPORAL
        </div>
      </div>

      {/* Recomp explanation card */}
      <div style={{ margin: '16px 20px 0', background: 'rgba(200,255,0,0.03)', border: '1.5px solid rgba(200,255,0,0.1)', borderRadius: 16, padding: '14px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#c8ff00', marginBottom: 6, textTransform: 'uppercase' }}>
          ⚖️ Cómo leer tu progreso
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
          En recomposición, el peso puede <span style={{ color: '#f2f0ea', fontWeight: 700 }}>mantenerse o subir ligeramente</span> mientras perdés grasa y ganás músculo. La báscula mide ambos a la vez.{' '}
          <span style={{ color: '#c8ff00' }}>Tu progreso real está en las medidas y la fuerza.</span>
        </div>
        {proteinTarget && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,107,107,0.08)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ff6b6b' }}>PROTEÍNA DIARIA MÍNIMA</span>
            <span className="font-bebas" style={{ fontSize: 22, color: '#ff6b6b' }}>{proteinTarget}g</span>
          </div>
        )}
      </div>

      {/* Weight stats */}
      {weightStats && (
        <div style={{ margin: '16px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Peso actual', value: `${weightStats.current}kg`, color: '#f2f0ea' },
            { label: 'Variación',   value: `${weightStats.change > 0 ? '+' : ''}${weightStats.change}kg`, color: '#e8ff47', note: 'normal en recomp' },
            { label: 'Mínimo reg.', value: `${weightStats.lowest}kg`, color: '#4daaff' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#555', textTransform: 'uppercase' }}>{s.label}</div>
              <div className="font-bebas" style={{ fontSize: 22, color: s.color, marginTop: 4 }}>{s.value}</div>
              {s.note && <div style={{ fontSize: 8, color: '#555', marginTop: 2 }}>{s.note}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Weight chart */}
      {weights.length > 0 && (
        <div style={{ margin: '16px 20px 0' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>EVOLUCIÓN CORPORAL — ÚLTIMAS {weights.length} MEDICIONES</div>
          <div className="card" style={{ padding: '16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {weights.map((w, i) => {
                const h = Math.max(8, ((Number(w.weight_kg) - minWeight) / weightRange) * 68 + 12);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', background: '#e8ff47', borderRadius: '3px 3px 0 0', height: h, opacity: i === weights.length - 1 ? 1 : 0.45, transition: 'height 0.4s' }} />
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
        <div className="section-label" style={{ marginBottom: 12 }}>REGISTRAR PESO CORPORAL</div>
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

      {/* Body measurements */}
      <div style={{ margin: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-label">MEDIDAS CORPORALES</div>
          <button
            onClick={() => setShowMeasureForm(v => !v)}
            style={{ fontSize: 11, fontWeight: 700, color: '#c8ff00', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {showMeasureForm ? 'Cancelar' : '+ Registrar'}
          </button>
        </div>

        {showMeasureForm && (
          <form onSubmit={saveMeasurements} style={{ background: '#181818', border: '1.5px solid rgba(200,255,0,0.15)', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>Medidas en centímetros (cm)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input type="number" placeholder="Cintura (cm)" value={mForm.waist} onChange={e => setMForm(f => ({ ...f, waist: e.target.value }))} min={40} max={200} step={0.5} />
              <input type="number" placeholder="Pecho (cm)" value={mForm.chest} onChange={e => setMForm(f => ({ ...f, chest: e.target.value }))} min={40} max={200} step={0.5} />
              <input type="number" placeholder="Cadera (cm)" value={mForm.hip} onChange={e => setMForm(f => ({ ...f, hip: e.target.value }))} min={40} max={200} step={0.5} />
              <input type="number" placeholder="Brazo (cm)" value={mForm.arm} onChange={e => setMForm(f => ({ ...f, arm: e.target.value }))} min={15} max={70} step={0.5} />
              <input type="number" placeholder="Muslo (cm)" value={mForm.thigh} onChange={e => setMForm(f => ({ ...f, thigh: e.target.value }))} min={20} max={100} step={0.5} />
              <input type="date" value={mForm.date} onChange={e => setMForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <button className="btn-primary" type="submit">GUARDAR MEDIDAS</button>
          </form>
        )}

        {measurements.length === 0 && !showMeasureForm && (
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '20px', textAlign: 'center', color: '#444', fontSize: 12 }}>
            Registrá tus medidas para ver el progreso real de tu recomposición.
          </div>
        )}

        {measurements.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {measurements.slice(0, 4).map((m, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{new Date(m.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
                  {i === 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(200,255,0,0.1)', color: '#c8ff00' }}>ÚLTIMA</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {[
                    { l: 'CINTURA', v: m.waist },
                    { l: 'PECHO',   v: m.chest },
                    { l: 'CADERA',  v: m.hip },
                    { l: 'BRAZO',   v: m.arm },
                    { l: 'MUSLO',   v: m.thigh },
                  ].map(f => f.v ? (
                    <div key={f.l} style={{ textAlign: 'center' }}>
                      <div className="font-bebas" style={{ fontSize: 18, color: '#f2f0ea', lineHeight: 1 }}>{f.v}</div>
                      <div style={{ fontSize: 7, color: '#555', marginTop: 2, letterSpacing: 0.5 }}>{f.l}</div>
                    </div>
                  ) : null)}
                </div>
                {latest && i === 1 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1e1e1e', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      { l: 'Cintura', prev: measurements[1]?.waist, curr: latest.waist },
                      { l: 'Pecho',   prev: measurements[1]?.chest,  curr: latest.chest },
                      { l: 'Brazo',   prev: measurements[1]?.arm,    curr: latest.arm },
                    ].map(d => {
                      if (!d.prev || !d.curr) return null;
                      const diff = parseFloat(d.curr) - parseFloat(d.prev);
                      if (isNaN(diff)) return null;
                      return (
                        <span key={d.l} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', color: diff === 0 ? '#666' : diff > 0 ? '#3ddc84' : '#ff6b6b' }}>
                          {d.l} {diff > 0 ? '+' : ''}{diff.toFixed(1)}cm
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Records — strength progression */}
      {prs.length > 0 && (
        <div style={{ margin: '16px 20px 0' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>RÉCORDS DE FUERZA — SOBRECARGA PROGRESIVA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {prs.map((pr, i) => (
              <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{pr.exercise_name}</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{new Date(pr.created_at).toLocaleDateString('es')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {pr.best_weight && <div className="font-bebas" style={{ fontSize: 24, color: '#e8ff47', lineHeight: 1 }}>{pr.best_weight}<span style={{ fontSize: 14 }}>kg</span></div>}
                  {pr.reps && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{pr.reps} reps</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly sessions */}
      {sessions.length > 0 && (
        <div style={{ margin: '16px 20px 0' }}>
          <div className="section-label" style={{ marginBottom: 12 }}>CONSISTENCIA SEMANAL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.slice(0, 6).map((s, i) => {
              const pct = s.total > 0 ? Math.round((Number(s.completed) / Number(s.total)) * 100) : 0;
              const weekStr = new Date(s.week).toLocaleDateString('es', { month: 'short', day: 'numeric' });
              return (
                <div key={i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Sem. {weekStr}</span>
                    <span style={{ fontSize: 13, color: pct >= 80 ? '#3ddc84' : '#e8ff47', fontWeight: 700 }}>{Number(s.completed)}/{Number(s.total)} sesiones</span>
                  </div>
                  <div style={{ height: 4, background: '#2a2a2a', borderRadius: 4 }}>
                    <div style={{ height: '100%', background: pct >= 80 ? '#3ddc84' : '#e8ff47', width: `${pct}%`, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
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
