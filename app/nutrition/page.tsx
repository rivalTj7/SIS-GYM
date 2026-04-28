'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

type FoodLog = { id: string; food_name: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; meal_type: string };

const MEAL_LABELS: Record<string, string> = {
  desayuno: '🌅 Desayuno',
  almuerzo: '☀️ Almuerzo',
  cena: '🌙 Cena',
  snack: '🍎 Snack',
};

function MacroRing({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = 32, circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" stroke="#2a2a2a" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" stroke={color}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s' }}
        />
      </svg>
      <div style={{ textAlign: 'center', marginTop: -4 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color }}>{Math.round(value)}</div>
        <div style={{ fontSize: 10, color: '#666', fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ food_name: '', kcal: '', protein_g: '', carbs_g: '', fat_g: '', meal_type: 'desayuno' });
  const [saving, setSaving] = useState(false);

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

  const goalKcal = profile?.goal_kcal ?? 0;
  const goalProt = profile?.goal_prot ?? 0;
  const goalCarb = profile?.goal_carb ?? 0;

  const byMeal = ['desayuno', 'almuerzo', 'cena', 'snack'].map(m => ({
    key: m,
    label: MEAL_LABELS[m],
    items: foods.filter(f => f.meal_type === m),
  })).filter(m => m.items.length > 0);

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 0' }}>
        <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 4, color: '#e8ff47' }}>NUTRICIÓN</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ marginTop: 12, background: '#111', border: '1.5px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#f2f0ea', width: 'auto' }}
        />
      </div>

      {/* Macro rings */}
      <div style={{ margin: '20px 20px 0', background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <MacroRing value={totals.kcal} max={goalKcal || 2000} color="#e8ff47" label={`kcal${goalKcal ? `/${goalKcal}` : ''}`} />
          <MacroRing value={totals.protein_g} max={goalProt || 150} color="#ff6b35" label={`prot${goalProt ? `/${goalProt}g` : 'g'}`} />
          <MacroRing value={totals.carbs_g} max={goalCarb || 200} color="#4daaff" label={`carbs${goalCarb ? `/${goalCarb}g` : 'g'}`} />
          <MacroRing value={totals.fat_g} max={80} color="#a78bfa" label="grasas/g" />
        </div>
      </div>

      {/* Add food button */}
      <div style={{ margin: '16px 20px 0' }}>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ CANCELAR' : '+ AGREGAR ALIMENTO'}
        </button>
      </div>

      {/* Add food form */}
      {showForm && (
        <form onSubmit={addFood} style={{ margin: '12px 20px 0', background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
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

      {/* Food log */}
      <div style={{ margin: '20px 20px 0' }}>
        {loadingData ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
        ) : byMeal.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
            <div style={{ fontSize: 40 }}>🥗</div>
            <div style={{ marginTop: 12, fontSize: 14 }}>No hay alimentos registrados hoy</div>
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
                  <button onClick={() => deleteFood(food.id)} style={{
                    background: 'transparent', border: 'none', color: '#666',
                    fontSize: 18, cursor: 'pointer', padding: '4px 8px',
                  }}>×</button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
