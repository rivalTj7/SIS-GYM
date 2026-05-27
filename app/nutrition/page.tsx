'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

type FoodLog = { id: string; food_name: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; meal_type: string };
type FoodEstimate = {
  food_name: string; serving_description: string; kcal: number;
  protein_g: number; carbs_g: number; fat_g: number;
  confidence: 'alta' | 'media' | 'baja'; notes: string;
  items: Array<{ name: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number }>;
};

const MEAL_LABELS: Record<string, { emoji: string; label: string }> = {
  desayuno: { emoji: '🌅', label: 'Desayuno' },
  almuerzo: { emoji: '☀️', label: 'Almuerzo' },
  cena:     { emoji: '🌙', label: 'Cena' },
  snack:    { emoji: '🍎', label: 'Snack' },
};

const CONFIDENCE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  alta:  { bg: 'rgba(61,220,132,0.1)',  color: '#3ddc84', label: '● Alta confianza' },
  media: { bg: 'rgba(200,255,0,0.1)',   color: '#c8ff00', label: '◑ Confianza media' },
  baja:  { bg: 'rgba(255,107,107,0.1)', color: '#ff6b6b', label: '○ Baja confianza' },
};

function MacroRing({ value, max, color, label, sublabel }: {
  value: number; max: number; color: string; label: string; sublabel?: string;
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = 30, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 76, height: 76 }}>
        <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="38" cy="38" r={r} fill="none" strokeWidth="6" stroke="rgba(255,255,255,0.06)" />
          <circle cx="38" cy="38" r={r} fill="none" strokeWidth="6" stroke={color}
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1 }}>{Math.round(value)}</div>
          {sublabel && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: 1 }}>{sublabel}</div>}
        </div>
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [foods, setFoods] = useState<FoodLog[]>([]);
  const [totals, setTotals] = useState({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  const [loadingData, setLoadingData] = useState(false);

  const [query, setQuery] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<FoodEstimate | null>(null);
  const [mealType, setMealType] = useState('desayuno');
  const [savingEstimate, setSavingEstimate] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ food_name: '', kcal: '', protein_g: '', carbs_g: '', fat_g: '', meal_type: 'desayuno' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, date]);

  async function fetchData() {
    setLoadingData(true);
    try {
      const res = await fetch(`/api/nutrition?date=${date}`);
      const data = await res.json();
      setFoods(data.foods ?? []);
      setTotals(data.totals ?? { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
    } catch {}
    setLoadingData(false);
  }

  async function estimateFood() {
    if (!query.trim()) return;
    setEstimating(true);
    setEstimate(null);
    try {
      const res = await fetch('/api/nutrition/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: query, servings: 1 }),
      });
      const data = await res.json();
      if (res.ok) setEstimate(data.estimate);
      else showToast('Error: ' + (data.error ?? 'Error al estimar'));
    } catch { showToast('Error de conexión'); }
    setEstimating(false);
  }

  async function saveEstimate() {
    if (!estimate) return;
    setSavingEstimate(true);
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: estimate.food_name,
          kcal: estimate.kcal,
          protein_g: estimate.protein_g,
          carbs_g: estimate.carbs_g,
          fat_g: estimate.fat_g,
          meal_type: mealType,
          logged_at: date,
        }),
      });
      if (res.ok) {
        setQuery('');
        setEstimate(null);
        showToast(`${estimate.food_name} guardado`);
        await fetchData();
      }
    } catch {}
    setSavingEstimate(false);
  }

  async function addFood(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: form.food_name,
          kcal: Number(form.kcal),
          protein_g: Number(form.protein_g) || 0,
          carbs_g: Number(form.carbs_g) || 0,
          fat_g: Number(form.fat_g) || 0,
          meal_type: form.meal_type,
          logged_at: date,
        }),
      });
      setForm({ food_name: '', kcal: '', protein_g: '', carbs_g: '', fat_g: '', meal_type: 'desayuno' });
      setShowForm(false);
      showToast('Alimento guardado');
      await fetchData();
    } catch {}
    setSaving(false);
  }

  async function deleteFood(id: string) {
    try {
      await fetch(`/api/nutrition?id=${id}`, { method: 'DELETE' });
      await fetchData();
    } catch {}
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const goalKcal = profile?.goal_kcal ?? 0;
  const goalProt = profile?.goal_prot ?? 0;
  const goalCarb = profile?.goal_carb ?? 0;
  const kcalPct = goalKcal > 0 ? Math.min(100, Math.round((totals.kcal / goalKcal) * 100)) : 0;

  const byMeal = ['desayuno', 'almuerzo', 'cena', 'snack']
    .map(m => ({ key: m, ...MEAL_LABELS[m], items: foods.filter(f => f.meal_type === m) }))
    .filter(m => m.items.length > 0);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(200,255,0,0.2)', borderTopColor: '#c8ff00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100dvh', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: '28px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="font-bebas" style={{
            fontSize: 38,
            letterSpacing: 4,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #c8ff00, #ffee00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            NUTRICIÓN
          </div>
          {goalKcal > 0 && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: 2 }}>
              {kcalPct}% del objetivo diario
            </div>
          )}
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px', fontSize: 12, borderRadius: 10 }}
        />
      </div>

      {/* Macro rings */}
      <div style={{
        margin: '16px 20px 0',
        background: 'rgba(255,255,255,0.03)',
        border: '1.5px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '20px 12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <MacroRing value={totals.kcal}     max={goalKcal || 2000} color="#c8ff00" label="Calorías" sublabel={goalKcal ? `/${goalKcal}` : undefined} />
          <MacroRing value={totals.protein_g} max={goalProt || 150}  color="#ff6b6b" label="Proteína"  sublabel={goalProt ? `/${goalProt}g` : 'g'} />
          <MacroRing value={totals.carbs_g}   max={goalCarb || 200}  color="#4daaff" label="Carbos"    sublabel={goalCarb ? `/${goalCarb}g` : 'g'} />
          <MacroRing value={totals.fat_g}     max={80}               color="#a78bfa" label="Grasas"    sublabel="/80g" />
        </div>
        {/* Calorie progress bar */}
        {goalKcal > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              <span>Consumido: {totals.kcal} kcal</span>
              <span>Restante: {Math.max(0, goalKcal - totals.kcal)} kcal</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${kcalPct}%`,
                background: kcalPct >= 100 ? '#ff6b6b' : 'linear-gradient(90deg, #c8ff00, #aadc00)',
                borderRadius: 4,
                transition: 'width 0.6s ease',
                boxShadow: '0 0 8px rgba(200,255,0,0.4)',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* AI Estimator */}
      <div style={{
        margin: '14px 20px 0',
        background: 'rgba(200,255,0,0.03)',
        border: '1.5px solid rgba(200,255,0,0.1)',
        borderRadius: 20,
        padding: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28,
            background: 'rgba(200,255,0,0.12)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>✨</div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#c8ff00' }}>
            Estimar con IA
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
          Describí tu comida y calculamos los macros automáticamente.
        </div>

        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={'Ej: "2 huevos fritos con pan francés"\n"arroz con pollo, porción mediana"'}
          style={{ height: 76, resize: 'none', marginBottom: 10, fontSize: 14 }}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) estimateFood(); }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <select value={mealType} onChange={e => setMealType(e.target.value)} style={{ flex: 1, fontSize: 13 }}>
            <option value="desayuno">🌅 Desayuno</option>
            <option value="almuerzo">☀️ Almuerzo</option>
            <option value="cena">🌙 Cena</option>
            <option value="snack">🍎 Snack</option>
          </select>
          <button
            onClick={estimateFood}
            disabled={estimating || !query.trim()}
            style={{
              padding: '0 20px',
              background: estimating ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #c8ff00, #aadc00)',
              color: estimating ? 'rgba(255,255,255,0.3)' : '#0a0a0a',
              border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 12,
              letterSpacing: 1, cursor: estimating ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.2s',
              boxShadow: estimating ? 'none' : '0 4px 16px rgba(200,255,0,0.2)',
            }}
          >
            {estimating ? '⏳ ...' : 'ESTIMAR'}
          </button>
        </div>

        {/* Estimate result */}
        {estimate && (
          <div style={{
            marginTop: 14,
            background: 'rgba(255,255,255,0.03)',
            border: '1.5px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#f2f0ea' }}>{estimate.food_name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{estimate.serving_description}</div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                padding: '4px 10px', borderRadius: 100,
                background: CONFIDENCE_STYLE[estimate.confidence].bg,
                color: CONFIDENCE_STYLE[estimate.confidence].color,
              }}>
                {CONFIDENCE_STYLE[estimate.confidence].label}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
              {[
                { l: 'Kcal',    v: estimate.kcal,              c: '#c8ff00' },
                { l: 'Prot',    v: `${estimate.protein_g}g`,   c: '#ff6b6b' },
                { l: 'Carbs',   v: `${estimate.carbs_g}g`,     c: '#4daaff' },
                { l: 'Grasa',   v: `${estimate.fat_g}g`,       c: '#a78bfa' },
              ].map(m => (
                <div key={m.l} style={{
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '10px 4px',
                }}>
                  <div className="font-bebas" style={{ fontSize: 22, color: m.c, lineHeight: 1 }}>{m.v}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1, marginTop: 2 }}>{m.l}</div>
                </div>
              ))}
            </div>

            {estimate.items?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>
                  Desglose
                </div>
                {estimate.items.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    <span>{item.name}</span>
                    <span style={{ color: '#c8ff00', fontWeight: 700 }}>{item.kcal} kcal</span>
                  </div>
                ))}
              </div>
            )}

            {estimate.notes && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12, fontStyle: 'italic' }}>
                {estimate.notes}
              </div>
            )}

            <button
              onClick={saveEstimate}
              disabled={savingEstimate}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3ddc84, #2bb868)',
                color: '#0a0a0a',
                border: 'none', borderRadius: 12,
                padding: '13px',
                fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
                cursor: savingEstimate ? 'not-allowed' : 'pointer',
                opacity: savingEstimate ? 0.5 : 1,
                transition: 'opacity 0.2s',
                boxShadow: '0 4px 16px rgba(61,220,132,0.2)',
              }}
            >
              {savingEstimate ? 'Guardando...' : '+ Guardar en mi registro'}
            </button>
          </div>
        )}
      </div>

      {/* Manual entry */}
      <div style={{ margin: '12px 20px 0' }}>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{
            width: '100%',
            background: showForm ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${showForm ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
            color: 'rgba(255,255,255,0.6)',
            borderRadius: 14,
            padding: '13px',
            fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {showForm ? '✕ Cancelar' : '+ Agregar manualmente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addFood} style={{
          margin: '12px 20px 0',
          background: 'rgba(255,255,255,0.03)',
          border: '1.5px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: 18,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <input placeholder="Nombre del alimento *" value={form.food_name} onChange={e => setForm(f => ({ ...f, food_name: e.target.value }))} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input type="number" placeholder="Calorías *" value={form.kcal} onChange={e => setForm(f => ({ ...f, kcal: e.target.value }))} required min={0} />
            <input type="number" placeholder="Proteína (g)" value={form.protein_g} onChange={e => setForm(f => ({ ...f, protein_g: e.target.value }))} min={0} step={0.1} />
            <input type="number" placeholder="Carbos (g)" value={form.carbs_g} onChange={e => setForm(f => ({ ...f, carbs_g: e.target.value }))} min={0} step={0.1} />
            <input type="number" placeholder="Grasa (g)" value={form.fat_g} onChange={e => setForm(f => ({ ...f, fat_g: e.target.value }))} min={0} step={0.1} />
          </div>
          <select value={form.meal_type} onChange={e => setForm(f => ({ ...f, meal_type: e.target.value }))}>
            <option value="desayuno">🌅 Desayuno</option>
            <option value="almuerzo">☀️ Almuerzo</option>
            <option value="cena">🌙 Cena</option>
            <option value="snack">🍎 Snack</option>
          </select>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar alimento'}
          </button>
        </form>
      )}

      {/* Food log */}
      <div style={{ margin: '20px 20px 0' }}>
        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(200,255,0,0.15)', borderTopColor: '#c8ff00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : byMeal.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.25)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥗</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Sin registros por ahora</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Describí tu primera comida arriba ↑</div>
          </div>
        ) : (
          byMeal.map(meal => (
            <div key={meal.key} style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 10,
              }}>
                <span style={{ fontSize: 16 }}>{meal.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  {meal.label}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#c8ff00' }}>
                  {meal.items.reduce((s, f) => s + f.kcal, 0)} kcal
                </span>
              </div>
              {meal.items.map(food => (
                <div key={food.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '13px 14px', marginBottom: 8,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f2f0ea' }}>{food.food_name}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
                      <span style={{ fontSize: 10, color: '#c8ff00', fontWeight: 700 }}>{food.kcal} kcal</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{Math.round(food.protein_g)}g P</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{Math.round(food.carbs_g)}g C</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{Math.round(food.fat_g)}g G</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFood(food.id)}
                    style={{
                      background: 'rgba(255,77,77,0.08)',
                      border: '1px solid rgba(255,77,77,0.15)',
                      color: 'rgba(255,107,107,0.7)',
                      width: 30, height: 30,
                      borderRadius: 8, fontSize: 16,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(10,10,10,0.95)',
          border: '1.5px solid rgba(200,255,0,0.2)',
          backdropFilter: 'blur(20px)',
          color: '#c8ff00', padding: '11px 20px',
          borderRadius: 100, fontWeight: 700, fontSize: 12,
          letterSpacing: 0.5, zIndex: 500, whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease',
        }}>
          ✓ {toast}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      <BottomNav />
    </div>
  );
}
