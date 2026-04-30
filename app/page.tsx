'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────
type User = { id: string; email: string; name: string };
type Profile = { tdee: number; goal_kcal: number; goal_prot: number; goal_carb: number } | null;
type FoodLog = { id: string; food_name: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; meal_type: string };
type WeightLog = { id: string; weight_kg: number; logged_at: string };
type Session = { id: string; day_key: string; split_type: string; mode: 'gym' | 'casa'; completed: boolean };
type FoodEstimate = {
  food_name: string; serving_description: string; kcal: number;
  protein_g: number; carbs_g: number; fat_g: number;
  confidence: string; notes: string;
  items: Array<{ name: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number }>;
};

// ── Constants ──────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10);
const DAY_IDX = (new Date().getDay() + 6) % 7;

const PLAN = [
  { day: 'LUN', label: 'PUSH — PECHO', split: 'push1' },
  { day: 'MAR', label: 'PULL — ESPALDA', split: 'pull1' },
  { day: 'MIÉ', label: 'LEGS — PIERNAS', split: 'legs1' },
  { day: 'JUE', label: 'PUSH 2 — HOMBROS', split: 'push2' },
  { day: 'VIE', label: 'PULL 2 — ESPALDA', split: 'pull2' },
  { day: 'SÁB', label: 'ARNOLD — BRAZOS', split: 'arms' },
  { day: 'DOM', label: 'DESCANSO ACTIVO', split: 'rest' },
];

const MEAL_TYPES = ['desayuno', 'almuerzo', 'cena', 'snack'];
const CONFIDENCE_COLOR: Record<string, string> = {
  alta: '#3ddc84', media: '#c8ff00', baja: '#ff4d4d',
};

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'home' | 'rutina' | 'nutricion' | 'progreso'>('home');

  useEffect(() => { fetchMe(); }, []);

  async function fetchMe() {
    try {
      const r = await fetch('/api/auth/me');
      if (r.ok) { const d = await r.json(); setUser(d.user); setProfile(d.profile); }
    } finally { setLoading(false); }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null); setProfile(null);
  }

  if (loading) return <Spinner />;
  if (!user) return <AuthScreen onAuth={(u, p) => { setUser(u); setProfile(p); }} />;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#f2f0ea', fontFamily: 'DM Sans, sans-serif', paddingBottom: 80 }}>
      {tab === 'home' && <HomeTab user={user} profile={profile} onLogout={logout} />}
      {tab === 'rutina' && <RutinaTab />}
      {tab === 'nutricion' && <NutricionTab profile={profile} onProfileSaved={setProfile} />}
      {tab === 'progreso' && <ProgresoTab />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

// ── Bottom Nav ────────────────────────────────────────────
function BottomNav({ tab, setTab }: { tab: string; setTab: (t: any) => void }) {
  const items = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'rutina', icon: '💪', label: 'Rutina' },
    { id: 'nutricion', icon: '🥗', label: 'Nutrición' },
    { id: 'progreso', icon: '📊', label: 'Progreso' },
  ];
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.95)', borderTop: '1px solid #2a2a2a', display: 'flex', backdropFilter: 'blur(12px)', zIndex: 50 }}>
      {items.map(i => (
        <button key={i.id} onClick={() => setTab(i.id)} style={{ flex: 1, padding: '12px 8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: tab === i.id ? '#c8ff00' : '#666', transition: 'color .15s' }}>
          <span style={{ fontSize: 20 }}>{i.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{i.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Auth Screen ───────────────────────────────────────────
function AuthScreen({ onAuth }: { onAuth: (u: User, p: Profile) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setError('');
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? { email, password } : { email, name, password };
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { setError(d.error || 'Error'); return; }
    const me = await fetch('/api/auth/me');
    const meData = await me.json();
    onAuth(d.user, meData.profile || null);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 52, letterSpacing: 4, color: '#c8ff00', marginBottom: 4 }}>BURN GT</div>
      <div style={{ color: '#666', fontSize: 12, marginBottom: 40, letterSpacing: 2, textTransform: 'uppercase' }}>Tu sistema de transformación</div>
      <div style={{ width: '100%', maxWidth: 360, background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '10px', background: mode === m ? '#c8ff00' : '#1a1a1a', color: mode === m ? '#000' : '#666', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>
        {mode === 'register' && <Input label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" />}
        <Input label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" type="email" />
        <Input label="Contraseña" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
        {error && <div style={{ color: '#ff4d4d', fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button onClick={submit} disabled={busy} style={{ width: '100%', background: '#c8ff00', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 18, letterSpacing: 2, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? '...' : mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
        </button>
      </div>
    </div>
  );
}

// ── Home Tab ──────────────────────────────────────────────
function HomeTab({ user, profile, onLogout }: { user: User; profile: Profile; onLogout: () => void }) {
  const todayPlan = PLAN[DAY_IDX];

  return (
    <div>
      <div style={{ padding: '20px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Bienvenido de vuelta</div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, letterSpacing: 1, lineHeight: 1, color: '#c8ff00' }}>{user.name.toUpperCase()}</div>
        </div>
        <button onClick={onLogout} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', borderRadius: 8, padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}>Salir</button>
      </div>

      {/* Today card */}
      <div style={{ margin: '20px 18px 0', background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #2a2a2a', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 4 }}>HOY — {todayPlan.day}</div>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, letterSpacing: 1 }}>{todayPlan.label}</div>
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 10px', background: 'rgba(200,255,0,0.1)', color: '#c8ff00', borderRadius: 4 }}>
            {todayPlan.split === 'rest' ? '😴 DESCANSO' : '🏋️ PPL+ARNOLD'}
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            {todayPlan.split === 'rest' ? 'Día de descanso activo — movilidad y recuperación.' : 'Recordá registrar tus series y elegir gym o casa cuando abras la sesión.'}
          </div>
        </div>
      </div>

      {/* Macro targets */}
      {profile ? (
        <div style={{ margin: '16px 18px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>OBJETIVOS DIARIOS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Calorías', val: profile.goal_kcal, color: '#c8ff00', unit: 'kcal' },
              { label: 'Proteína', val: profile.goal_prot, color: '#4daaff', unit: 'g' },
              { label: 'Carbos', val: profile.goal_carb, color: '#ff4d4d', unit: 'g' },
            ].map(m => (
              <div key={m.label} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 26, color: m.color, lineHeight: 1 }}>{m.val}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#555', marginTop: 3 }}>{m.label} {m.unit}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ margin: '16px 18px 0', background: 'rgba(200,255,0,0.04)', border: '1px solid rgba(200,255,0,0.15)', borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#c8ff00', marginBottom: 4, fontWeight: 700 }}>⚙️ Configura tu perfil nutricional</div>
          <div style={{ fontSize: 12, color: '#666' }}>Ve a la pestaña Nutrición para calcular tu TDEE y macros.</div>
        </div>
      )}

      {/* Principles */}
      <div style={{ margin: '20px 18px 0', paddingBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>PRINCIPIOS</div>
        {[
          { icon: '📏', title: 'La recomposición es lenta', desc: 'No se ve en 2 semanas. Se nota en meses. Constancia sobre perfección.' },
          { icon: '⚡', title: 'Series cerca del fallo', desc: 'Ejercicios compuestos, progresión de cargas, 0–2 RIR.' },
          { icon: '😴', title: 'El músculo crece descansando', desc: 'Mínimo 7 horas. Dormir a la misma hora es beneficioso.' },
        ].map(p => (
          <div key={p.title} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{p.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Rutina Tab ────────────────────────────────────────────
function RutinaTab() {
  const [selDay, setSelDay] = useState(DAY_IDX);
  const [sessionMode, setSessionMode] = useState<'gym' | 'casa' | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const dayPlan = PLAN[selDay];

  useEffect(() => {
    setSessionMode(null);
    setSession(null);
    setDone({});
    if (dayPlan.split !== 'rest') {
      setShowModeModal(true);
    }
  }, [selDay]);

  async function selectMode(mode: 'gym' | 'casa') {
    setSessionMode(mode);
    setShowModeModal(false);
    // Create/get session
    const r = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_key: dayPlan.day, split_type: dayPlan.split, mode, session_date: TODAY }),
    });
    if (r.ok) { const d = await r.json(); setSession(d.session); }
  }

  async function completeSession() {
    if (!session) return;
    await fetch(`/api/workouts/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    setSession(s => s ? { ...s, completed: true } : null);
  }

  return (
    <div>
      {/* Day strip */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #2a2a2a', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 40 }}>
        {PLAN.map((d, i) => (
          <button key={i} onClick={() => setSelDay(i)} style={{ flexShrink: 0, padding: '12px 14px 10px', background: 'none', border: 'none', borderBottom: `3px solid ${i === selDay ? '#c8ff00' : 'transparent'}`, cursor: 'pointer', textAlign: 'center', minWidth: 52, transition: 'all .15s' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 17, letterSpacing: 1, color: i === selDay ? '#c8ff00' : '#555' }}>{d.day}</div>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: i === selDay ? '#888' : '#333', marginTop: 2 }}>
              {d.split === 'rest' ? 'DESC' : d.split.replace(/[12]/g, '').toUpperCase()}
            </div>
          </button>
        ))}
      </div>

      {/* Mode selection modal */}
      {showModeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>SESIÓN DE HOY — {dayPlan.day}</div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>{dayPlan.label}</div>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏋️</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>¿Vas al gym hoy?</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 32, textAlign: 'center', maxWidth: 280 }}>Elegí la rutina que vas a hacer. Podés cambiarla después si necesitás.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
            <button onClick={() => selectMode('gym')} style={{ background: '#c8ff00', color: '#000', border: 'none', borderRadius: 14, padding: '20px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, letterSpacing: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              🏛️ SÍ, VOY AL GYM
            </button>
            <button onClick={() => selectMode('casa')} style={{ background: '#1a1a1a', color: '#ff4d4d', border: '1.5px solid #ff4d4d', borderRadius: 14, padding: '20px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, letterSpacing: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              🏠 NO, ME QUEDO EN CASA
            </button>
            <button onClick={() => { setShowModeModal(false); setSelDay(DAY_IDX); }} style={{ background: 'none', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Rest day */}
      {dayPlan.split === 'rest' && (
        <div style={{ padding: '32px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🧘</div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 38, letterSpacing: 2, color: '#3ddc84', marginBottom: 8 }}>DESCANSO ACTIVO</div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 24, maxWidth: 280, margin: '0 auto 24px' }}>El músculo crece durante el descanso. Este día es tan importante como el lunes.</div>
          {['🔄 Rotaciones articulares · 5 min', '🦵 Estiramiento cuádriceps e isquios · 45 seg × lado', '🌊 Cobra + Child\'s Pose · 60 seg × postura', '🚶 Caminata suave · 20–30 min', '🥩 Proteína + hidratación alta'].map(item => (
            <div key={item} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', textAlign: 'left', marginBottom: 8, fontSize: 13 }}>{item}</div>
          ))}
        </div>
      )}

      {/* Session header when mode is selected */}
      {sessionMode && dayPlan.split !== 'rest' && (
        <div style={{ padding: '0 18px' }}>
          <div style={{ paddingTop: 18, paddingBottom: 14 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 4, marginBottom: 10, background: sessionMode === 'gym' ? 'rgba(200,255,0,0.1)' : 'rgba(255,77,77,0.08)', color: sessionMode === 'gym' ? '#c8ff00' : '#ff4d4d' }}>
              {sessionMode === 'gym' ? '🏛️ GYM' : '🏠 CASA'}
            </div>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, letterSpacing: 1, lineHeight: 1 }}>{dayPlan.label}</div>
            <button onClick={() => setShowModeModal(true)} style={{ marginTop: 6, background: 'none', border: '1px solid #2a2a2a', color: '#555', borderRadius: 7, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>Cambiar modo</button>
            {session?.completed && <span style={{ marginLeft: 8, fontSize: 11, color: '#3ddc84', fontWeight: 700 }}>✓ SESIÓN COMPLETADA</span>}
          </div>

          {/* Exercise placeholder — shows split info */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: '16px', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
              Sesión <strong style={{ color: '#f2f0ea' }}>{dayPlan.split.toUpperCase()}</strong> · Modo <strong style={{ color: sessionMode === 'gym' ? '#c8ff00' : '#ff4d4d' }}>{sessionMode === 'gym' ? '🏛️ Gym' : '🏠 Casa'}</strong>
            </div>
            {session && <div style={{ marginTop: 8, fontSize: 11, color: '#555' }}>ID de sesión: {session.id.slice(0, 8)}... · Guardado en Neon ✓</div>}
          </div>

          {!session?.completed && (
            <button onClick={completeSession} style={{ width: '100%', background: '#c8ff00', color: '#000', border: 'none', borderRadius: 12, padding: '16px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 18, letterSpacing: 3, cursor: 'pointer', marginTop: 12 }}>
              ✓ COMPLETAR SESIÓN
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Nutricion Tab ─────────────────────────────────────────
function NutricionTab({ profile, onProfileSaved }: { profile: Profile; onProfileSaved: (p: any) => void }) {
  const [subTab, setSubTab] = useState<'log' | 'tdee'>('log');
  const [foods, setFoods] = useState<FoodLog[]>([]);
  const [totals, setTotals] = useState({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  const [loading, setLoading] = useState(false);

  // AI Estimator state
  const [query, setQuery] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<FoodEstimate | null>(null);
  const [mealType, setMealType] = useState('desayuno');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // TDEE form
  const [sex, setSex] = useState<'m' | 'f'>('m');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState<'sed' | 'med' | 'hi'>('med');
  const [goal, setGoal] = useState<'def' | 'mant' | 'vol' | 'agr'>('def');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => { fetchFoods(); }, []);

  async function fetchFoods() {
    const r = await fetch(`/api/nutrition?date=${TODAY}`);
    if (r.ok) { const d = await r.json(); setFoods(d.foods); setTotals(d.totals); }
  }

  async function estimateFood() {
    if (!query.trim()) return;
    setEstimating(true); setEstimate(null);
    const r = await fetch('/api/nutrition/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: query }),
    });
    const d = await r.json();
    setEstimating(false);
    if (r.ok) setEstimate(d.estimate);
    else showToast('Error: ' + d.error);
  }

  async function saveEstimate() {
    if (!estimate) return;
    setSaving(true);
    const r = await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        food_name: estimate.food_name,
        kcal: estimate.kcal,
        protein_g: estimate.protein_g,
        carbs_g: estimate.carbs_g,
        fat_g: estimate.fat_g,
        meal_type: mealType,
      }),
    });
    setSaving(false);
    if (r.ok) {
      setQuery(''); setEstimate(null);
      showToast(`✅ ${estimate.food_name} guardado`);
      fetchFoods();
    }
  }

  async function deleteFood(id: string) {
    await fetch(`/api/nutrition?id=${id}`, { method: 'DELETE' });
    fetchFoods();
  }

  async function saveProfile() {
    setSavingProfile(true);
    const r = await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sex, age: +age, weight_kg: +weight, height_cm: +height, activity, goal }),
    });
    if (r.ok) { const d = await r.json(); onProfileSaved(d.profile); showToast('✅ Perfil guardado'); }
    setSavingProfile(false);
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  return (
    <div>
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Seguimiento</div>
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 42, lineHeight: 0.9, letterSpacing: -1 }}>NUTRICIÓN<br /><span style={{ color: '#c8ff00' }}>Y MACROS</span></div>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 18px 0' }}>
        {([['log', '🥗 Registro'], ['tdee', '⚙️ Mi TDEE']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{ flex: 1, padding: '10px', background: subTab === id ? '#c8ff00' : '#111', color: subTab === id ? '#000' : '#555', border: `1px solid ${subTab === id ? '#c8ff00' : '#2a2a2a'}`, borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{label}</button>
        ))}
      </div>

      {subTab === 'log' && (
        <div style={{ padding: '16px 18px 0' }}>
          {/* Daily progress */}
          {profile && (
            <div style={{ marginBottom: 16 }}>
              {[
                { label: 'Calorías', curr: totals.kcal, goal: profile.goal_kcal, color: '#c8ff00', unit: 'kcal' },
                { label: 'Proteína', curr: Math.round(totals.protein_g), goal: profile.goal_prot, color: '#4daaff', unit: 'g' },
              ].map(m => (
                <div key={m.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, fontWeight: 700 }}>
                    <span style={{ color: '#888' }}>{m.label}</span>
                    <span style={{ color: m.color }}>{m.curr} / {m.goal} {m.unit}</span>
                  </div>
                  <div style={{ background: '#1a1a1a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: m.color, borderRadius: 4, width: `${Math.min(100, Math.round(m.curr / m.goal * 100))}%`, transition: 'width .4s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Estimator */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 10 }}>🤖 ESTIMAR CON IA</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>Describí tu comida en lenguaje natural y la IA calcula los macros.</div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={'Ej: "pan con huevo frito y salchicha"\n"2 tortillas con frijoles y queso"\n"arroz con pollo, porción grande"'}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 12px', color: '#f2f0ea', fontSize: 13, resize: 'none', outline: 'none', height: 80, fontFamily: 'inherit' }}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) estimateFood(); }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <select value={mealType} onChange={e => setMealType(e.target.value)} style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#f2f0ea', fontSize: 12 }}>
                {MEAL_TYPES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
              <button onClick={estimateFood} disabled={estimating || !query.trim()} style={{ padding: '8px 16px', background: estimating ? '#333' : '#c8ff00', color: estimating ? '#666' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {estimating ? '⏳ Estimando...' : '✨ Estimar'}
              </button>
            </div>

            {/* Estimate result */}
            {estimate && (
              <div style={{ marginTop: 14, background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{estimate.food_name}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{estimate.serving_description}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', borderRadius: 4, background: `${CONFIDENCE_COLOR[estimate.confidence]}22`, color: CONFIDENCE_COLOR[estimate.confidence] }}>
                    {estimate.confidence.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                  {[
                    { l: 'Kcal', v: estimate.kcal, c: '#c8ff00' },
                    { l: 'Prot', v: `${estimate.protein_g}g`, c: '#4daaff' },
                    { l: 'Carbs', v: `${estimate.carbs_g}g`, c: '#ff4d4d' },
                    { l: 'Grasas', v: `${estimate.fat_g}g`, c: '#f4a261' },
                  ].map(m => (
                    <div key={m.l} style={{ textAlign: 'center', background: '#1a1a1a', borderRadius: 8, padding: '8px 4px' }}>
                      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                {/* Breakdown */}
                {estimate.items?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>DESGLOSE</div>
                    {estimate.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: '1px solid #1a1a1a', color: '#888' }}>
                        <span>{item.name}</span>
                        <span style={{ color: '#c8ff00' }}>{item.kcal} kcal · {item.protein_g}g P</span>
                      </div>
                    ))}
                  </div>
                )}
                {estimate.notes && <div style={{ fontSize: 11, color: '#555', marginBottom: 10, fontStyle: 'italic' }}>💡 {estimate.notes}</div>}
                <button onClick={saveEstimate} disabled={saving} style={{ width: '100%', background: '#3ddc84', color: '#000', border: 'none', borderRadius: 9, padding: '11px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 15, letterSpacing: 2, cursor: 'pointer' }}>
                  {saving ? '...' : '+ GUARDAR EN MI REGISTRO'}
                </button>
              </div>
            )}
          </div>

          {/* Food log */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>REGISTRO DE HOY</div>
            {foods.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#555', fontSize: 12, padding: '20px 0' }}>Sin registros aún. Describí tu primera comida arriba ↑</div>
            ) : (
              foods.map(f => (
                <div key={f.id} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{f.food_name}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                      {f.kcal} kcal · {f.protein_g}g P · {f.meal_type}
                    </div>
                  </div>
                  <button onClick={() => deleteFood(f.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, padding: 4 }}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {subTab === 'tdee' && (
        <div style={{ padding: '16px 18px 0' }}>
          {profile && (
            <div style={{ background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: 12, padding: 14, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 4 }}>TU TDEE ACTUAL</div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 52, color: '#c8ff00', lineHeight: 1 }}>{profile.tdee}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>kcal de mantenimiento → objetivo: <strong style={{ color: '#f2f0ea' }}>{profile.goal_kcal} kcal</strong></div>
            </div>
          )}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {(['m', 'f'] as const).map(s => (
                <button key={s} onClick={() => setSex(s)} style={{ flex: 1, padding: '9px', background: sex === s ? '#c8ff00' : '#1a1a1a', color: sex === s ? '#000' : '#666', border: `1.5px solid ${sex === s ? '#c8ff00' : '#2a2a2a'}`, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {s === 'm' ? '♂ Hombre' : '♀ Mujer'}
                </button>
              ))}
            </div>
            <Input label="Edad (años)" value={age} onChange={setAge} placeholder="25" type="number" />
            <Input label="Peso (kg)" value={weight} onChange={setWeight} placeholder="75" type="number" />
            <Input label="Altura (cm)" value={height} onChange={setHeight} placeholder="175" type="number" />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Nivel de actividad</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([['sed', '😴 Sedentario ×1.2'], ['med', '⚖️ Activo ×1.55'], ['hi', '🔥 Muy activo ×1.75']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setActivity(v)} style={{ flex: 1, minWidth: 0, padding: '8px 6px', background: activity === v ? '#c8ff00' : '#1a1a1a', color: activity === v ? '#000' : '#666', border: `1.5px solid ${activity === v ? '#c8ff00' : '#2a2a2a'}`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Objetivo</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {([['def', '🔥 Quemar grasa'], ['mant', '⚖️ Recomposición'], ['vol', '📈 Ganar músculo'], ['agr', '⚡ Déficit agresivo']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setGoal(v)} style={{ padding: '10px', background: goal === v ? (v === 'def' || v === 'agr' ? 'rgba(255,77,77,0.1)' : 'rgba(200,255,0,0.08)') : '#1a1a1a', color: goal === v ? (v === 'def' || v === 'agr' ? '#ff4d4d' : '#c8ff00') : '#666', border: `1.5px solid ${goal === v ? (v === 'def' || v === 'agr' ? '#ff4d4d' : '#c8ff00') : '#2a2a2a'}`, borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>{l}</button>
                ))}
              </div>
            </div>
            <button onClick={saveProfile} disabled={savingProfile || !age || !weight || !height} style={{ width: '100%', background: savingProfile ? '#333' : '#c8ff00', color: savingProfile ? '#666' : '#000', border: 'none', borderRadius: 10, padding: '13px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 16, letterSpacing: 2, cursor: 'pointer' }}>
              {savingProfile ? 'GUARDANDO...' : 'CALCULAR Y GUARDAR'}
            </button>
          </div>
          <div style={{ margin: '12px 0', background: 'rgba(200,255,0,0.04)', border: '1px solid rgba(200,255,0,0.12)', borderRadius: 12, padding: 13 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 6 }}>FÓRMULA MIFFLIN–ST JEOR</div>
            <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7 }}>
              <strong style={{ color: '#888' }}>Hombres:</strong> (10 × kg) + (6.25 × cm) – (5 × edad) + 5<br />
              <strong style={{ color: '#888' }}>Mujeres:</strong> (10 × kg) + (6.25 × cm) – (5 × edad) – 161<br />
              × Factor de actividad = TDEE
            </div>
          </div>
          <div style={{ background: 'rgba(77,170,255,0.05)', border: '1px solid rgba(77,170,255,0.15)', borderRadius: 12, padding: 13, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4daaff', marginBottom: 5 }}>¿CÓMO AJUSTAR?</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>Si después de <strong style={{ color: '#f2f0ea' }}>2 semanas</strong> tu peso no cambia: suma 200 kcal si querés subir, resta 200 si querés bajar.</div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #2a2a2a', color: '#c8ff00', padding: '10px 18px', borderRadius: 9, fontWeight: 700, fontSize: 12, zIndex: 500, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Progreso Tab ──────────────────────────────────────────
function ProgresoTab() {
  const [data, setData] = useState<any>(null);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [prog, w] = await Promise.all([
      fetch('/api/progress').then(r => r.json()),
      fetch('/api/weight?days=60').then(r => r.json()),
    ]);
    setData(prog);
    setWeights(w.logs || []);
    setLoading(false);
  }

  async function logWeight() {
    const v = parseFloat(newWeight);
    if (isNaN(v) || v < 30 || v > 300) return;
    const r = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight_kg: v }),
    });
    if (r.ok) {
      setNewWeight('');
      showToast(`✅ ${v} kg registrado`);
      fetchAll();
    }
  }

  async function deleteWeight(id: string) {
    await fetch(`/api/weight?id=${id}`, { method: 'DELETE' });
    fetchAll();
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Cargando...</div>;

  const ws = data?.weightStats;
  const ts = data?.trainingStats;
  const ns = data?.nutritionStats;

  return (
    <div>
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Tu transformación</div>
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 42, lineHeight: 0.9, letterSpacing: -1 }}>PROGRESO<br /><span style={{ color: '#c8ff00' }}>Y STATS</span></div>
      </div>

      {/* Key stats */}
      <div style={{ margin: '20px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Racha actual', val: data?.streak ?? 0, unit: 'días 🔥', color: '#c8ff00' },
          { label: 'Sesiones completadas', val: ts?.total_completed ?? 0, unit: 'total', color: '#4daaff' },
          { label: 'Peso actual', val: ws?.current ? `${ws.current} kg` : '—', unit: 'corporal', color: '#3ddc84' },
          { label: 'Cambio de peso', val: ws?.change ? `${ws.change > 0 ? '+' : ''}${ws.change} kg` : '—', unit: 'total', color: ws?.change < 0 ? '#3ddc84' : '#ff4d4d' },
        ].map(s => (
          <div key={s.label} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 16 }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.unit}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#333', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weight logger */}
      <div style={{ margin: '16px 18px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>REGISTRAR PESO HOY</div>
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="75.5 kg" type="number" step="0.1"
              style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 9, padding: '10px 12px', color: '#f2f0ea', fontSize: 15, outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && logWeight()} />
            <button onClick={logWeight} style={{ background: '#c8ff00', color: '#000', border: 'none', borderRadius: 9, padding: '10px 18px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 14, letterSpacing: 1.5, cursor: 'pointer' }}>+ KG</button>
          </div>

          {/* Mini weight chart */}
          {weights.length >= 2 && (
            <div style={{ marginTop: 12, position: 'relative' }}>
              <MiniChart data={weights.slice(0, 14).reverse()} />
            </div>
          )}

          {/* Weight list */}
          {weights.slice(0, 7).map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ fontSize: 11, color: '#555' }}>{w.logged_at}</span>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20 }}>{w.weight_kg} kg</span>
              <button onClick={() => deleteWeight(w.id)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* PRs */}
      {data?.prs?.length > 0 && (
        <div style={{ margin: '16px 18px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>🏆 RÉCORDS PERSONALES</div>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 14 }}>
            {data.prs.map((pr: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < data.prs.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{pr.exercise_name}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{pr.reps} reps</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, color: '#c8ff00' }}>{pr.best_weight} kg</div>
                  <div style={{ fontSize: 9, color: '#444' }}>PR 🏆</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition stats */}
      {ns && (
        <div style={{ margin: '16px 18px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>NUTRICIÓN (últimos 28 días)</div>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, textAlign: 'center' }}>
            <div><div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#c8ff00' }}>{ns.avg_kcal}</div><div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Prom kcal</div></div>
            <div><div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#4daaff' }}>{ns.avg_protein}</div><div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Prom prot g</div></div>
            <div><div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#3ddc84' }}>{ns.days_tracked}</div><div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Días log</div></div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #2a2a2a', color: '#c8ff00', padding: '10px 18px', borderRadius: 9, fontWeight: 700, fontSize: 12, zIndex: 500, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Mini Components ───────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 5 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 9, padding: '10px 12px', color: '#f2f0ea', fontSize: 15, outline: 'none', WebkitAppearance: 'none' }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 42, letterSpacing: 4, color: '#c8ff00' }}>BURN GT</div>
    </div>
  );
}

function MiniChart({ data }: { data: WeightLog[] }) {
  if (data.length < 2) return null;
  const vals = data.map(d => Number(d.weight_kg));
  const min = Math.min(...vals) - 0.5;
  const max = Math.max(...vals) + 0.5;
  const w = 300, h = 60, pad = 8;

  const pts = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 60, overflow: 'visible', marginTop: 8 }}>
      <polyline points={pts.join(' ')} fill="none" stroke="#c8ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {vals.map((v, i) => {
        const [x, y] = pts[i].split(',');
        return <circle key={i} cx={x} cy={y} r="3" fill="#c8ff00" />;
      })}
    </svg>
  );
}
