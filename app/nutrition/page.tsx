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

const MEAL_LABELS: Record<string, string> = {
  desayuno: '🌅 Desayuno', almuerzo: '☀️ Almuerzo', cena: '🌙 Cena', snack: '🍎 Snack',
};
const CONFIDENCE_COLOR: Record<string, string> = { alta: '#3ddc84', media: '#e8ff47', baja: '#ff6b35' };

function MacroRing({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = 32, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" stroke="#2a2a2a" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" stroke={color}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.5s' }}
        />
      </svg>
      <div style={{ textAlign: 'center', marginTop: -4 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color }}>{Math.round(value)}</div>
        <div style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>{label}</div>
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

  // AI estimator
  const [query, setQuery] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<FoodEstimate | null>(null);
  const [mealType, setMealType] = useState('desayuno');
  const [savingEstimate, setSavingEstimate] = useState(false);

  // Manual form
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
        showToast(`✅ ${estimate.food_name} guardado`);
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
  const byMeal = ['desayuno', 'almuerzo', 'cena', 'snack']
    .map(m => ({ key: m, label: MEAL_LABELS[m], items: foods.filter(f => f.meal_type === m) }))
    .filter(m => m.items.length > 0);

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 4, color: '#e8ff47' }}>NUTRICIÓN</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
        />
      </div>

      {/* Macro rings */}
      <div style={{ margin: '20px 20px 0', background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <MacroRing value={totals.kcal}      max={goalKcal || 2000} color="#e8ff47" label={`kcal${goalKcal ? `/${goalKcal}` : ''}`} />
          <MacroRing value={totals.protein_g}  max={goalProt || 150}  color="#ff6b35" label={`prot${goalProt ? `/${goalProt}g` : 'g'}`} />
          <MacroRing value={totals.carbs_g}    max={goalCarb || 200}  color="#4daaff" label={`carbs${goalCarb ? `/${goalCarb}g` : 'g'}`} />
          <MacroRing value={totals.fat_g}      max={80}               color="#a78bfa" label="grasas/g" />
        </div>
      </div>

      {/* AI Estimator */}
      <div style={{ margin: '16px 20px 0', background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#e8ff47', marginBottom: 6 }}>🤖 ESTIMAR CON IA</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>Describí tu comida y la IA calcula los macros automáticamente.</div>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={'Ej: "2 huevos fritos con pan francés"\n"arroz con pollo, porción mediana"\n"tortillas con frijoles y queso"'}
          style={{ height: 80, resize: 'none', marginBottom: 10 }}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) estimateFood(); }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={mealType} onChange={e => setMealType(e.target.value)} style={{ flex: 1 }}>
            <option value="desayuno">Desayuno</option>
            <option value="almuerzo">Almuerzo</option>
            <option value="cena">Cena</option>
            <option value="snack">Snack</option>
          </select>
          <button onClick={estimateFood} disabled={estimating || !query.trim()} style={{
            padding: '11px 18px', background: estimating ? '#333' : '#e8ff47', color: estimating ? '#666' : '#000',
            border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {estimating ? '⏳...' : '✨ Estimar'}
          </button>
        </div>

        {/* Estimate result */}
        {estimate && (
          <div style={{ marginTop: 14, background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 14 }}>
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
                { l: 'Kcal', v: estimate.kcal, c: '#e8ff47' },
                { l: 'Prot', v: `${estimate.protein_g}g`, c: '#ff6b35' },
                { l: 'Carbs', v: `${estimate.carbs_g}g`, c: '#4daaff' },
                { l: 'Grasas', v: `${estimate.fat_g}g`, c: '#a78bfa' },
              ].map(m => (
                <div key={m.l} style={{ textAlign: 'center', background: '#1a1a1a', borderRadius: 8, padding: '8px 4px' }}>
                  <div className="font-bebas" style={{ fontSize: 20, color: m.c }}>{m.v}</div>
                  <div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1 }}>{m.l}</div>
                </div>
              ))}
            </div>
            {estimate.items?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>DESGLOSE</div>
                {estimate.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: '1px solid #1a1a1a', color: '#888' }}>
                    <span>{item.name}</span>
                    <span style={{ color: '#e8ff47' }}>{item.kcal} kcal · {item.protein_g}g P</span>
                  </div>
                ))}
              </div>
            )}
            {estimate.notes && <div style={{ fontSize: 11, color: '#555', marginBottom: 10, fontStyle: 'italic' }}>💡 {estimate.notes}</div>}
            <button onClick={saveEstimate} disabled={savingEstimate} style={{
              width: '100%', background: '#3ddc84', color: '#000', border: 'none', borderRadius: 9,
              padding: '11px', fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 15, letterSpacing: 2, cursor: 'pointer',
            }}>
              {savingEstimate ? '...' : '+ GUARDAR EN MI REGISTRO'}
            </button>
          </div>
        )}
      </div>

      {/* Manual entry toggle */}
      <div style={{ margin: '12px 20px 0' }}>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}
          style={{ background: showForm ? '#2a2a2a' : undefined, color: showForm ? '#666' : undefined }}>
          {showForm ? '✕ CANCELAR' : '+ AGREGAR MANUALMENTE'}
        </button>
      </div>

      {/* Manual form */}
      {showForm && (
        <form onSubmit={addFood} style={{ margin: '12px 20px 0', background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Nombre del alimento *" value={form.food_name} onChange={e => setForm(f => ({ ...f, food_name: e.target.value }))} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input type="number" placeholder="Calorías *" value={form.kcal} onChange={e => setForm(f => ({ ...f, kcal: e.target.value }))} required min={0} />
            <input type="number" placeholder="Proteína (g)" value={form.protein_g} onChange={e => setForm(f => ({ ...f, protein_g: e.target.value }))} min={0} step={0.1} />
            <input type="number" placeholder="Carbos (g)" value={form.carbs_g} onChange={e => setForm(f => ({ ...f, carbs_g: e.target.value }))} min={0} step={0.1} />
            <input type="number" placeholder="Grasa (g)" value={form.fat_g} onChange={e => setForm(f => ({ ...f, fat_g: e.target.value }))} min={0} step={0.1} />
          </div>
          <select value={form.meal_type} onChange={e => setForm(f => ({ ...f, meal_type: e.target.value }))}>
            <option value="desayuno">Desayuno</option>
            <option value="almuerzo">Almuerzo</option>
            <option value="cena">Cena</option>
            <option value="snack">Snack</option>
          </select>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'GUARDANDO...' : 'GUARDAR ALIMENTO'}
          </button>
        </form>
      )}

      {/* Food log by meal */}
      <div style={{ margin: '20px 20px 0' }}>
        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
        ) : byMeal.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
            <div style={{ fontSize: 40 }}>🥗</div>
            <div style={{ marginTop: 12, fontSize: 14 }}>Sin registros aún — describí tu primera comida arriba ↑</div>
          </div>
        ) : (
          byMeal.map(meal => (
            <div key={meal.key} style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>{meal.label}</div>
              {meal.items.map(food => (
                <div key={food.id} style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f2f0ea' }}>{food.food_name}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>
                      {food.kcal} kcal · {Math.round(food.protein_g)}g prot · {Math.round(food.carbs_g)}g carbs
                    </div>
                  </div>
                  <button onClick={() => deleteFood(food.id)} style={{ background: 'transparent', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>×</button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #2a2a2a', color: '#e8ff47', padding: '10px 18px', borderRadius: 9, fontWeight: 700, fontSize: 12, zIndex: 500, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
