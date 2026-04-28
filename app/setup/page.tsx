'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const ACTIVITY_OPTS = [
  { value: 'sed', label: 'Sedentario', desc: 'Poco o nada de ejercicio' },
  { value: 'med', label: 'Moderado', desc: '3–5 días/semana' },
  { value: 'hi', label: 'Intenso', desc: '6–7 días/semana' },
];

const GOAL_OPTS = [
  { value: 'def', label: 'Quemar grasa', desc: 'Déficit –400 kcal/día', color: '#ff6b35' },
  { value: 'mant', label: 'Mantener', desc: 'Recomposición corporal', color: '#e8ff47' },
  { value: 'vol', label: 'Ganar músculo', desc: 'Superávit +400 kcal/día', color: '#4daaff' },
  { value: 'agr', label: 'Déficit agresivo', desc: 'Pérdida rápida –500 kcal', color: '#ff4d4d' },
];

export default function SetupPage() {
  const { refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ sex: 'm', age: 25, weight_kg: 75, height_cm: 175, activity: 'med', goal: 'def' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, val: string | number) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: Number(form.age), weight_kg: Number(form.weight_kg), height_cm: Number(form.height_cm) }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      await refreshProfile();
      router.replace('/dashboard');
    } catch {
      setError('No se pudo guardar el perfil. Intenta de nuevo.');
      setLoading(false);
    }
  }

  const steps = [
    // Step 0: Sexo + Edad
    <div key="0" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div className="section-label" style={{ marginBottom: 14 }}>Sexo biológico</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[{ v: 'm', l: '♂ Masculino' }, { v: 'f', l: '♀ Femenino' }].map(opt => (
            <button key={opt.v} onClick={() => set('sex', opt.v)} style={{
              padding: '16px',
              borderRadius: 12,
              border: `1.5px solid ${form.sex === opt.v ? '#e8ff47' : '#2a2a2a'}`,
              background: form.sex === opt.v ? 'rgba(232,255,71,0.08)' : '#181818',
              color: form.sex === opt.v ? '#e8ff47' : '#f2f0ea',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>{opt.l}</button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 8 }}>Edad</label>
        <input type="number" value={form.age} onChange={e => set('age', Number(e.target.value))} min={15} max={80} />
      </div>
    </div>,

    // Step 1: Peso + Altura
    <div key="1" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 8 }}>Peso actual (kg)</label>
        <input type="number" value={form.weight_kg} onChange={e => set('weight_kg', Number(e.target.value))} min={40} max={200} step={0.5} />
      </div>
      <div>
        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 8 }}>Altura (cm)</label>
        <input type="number" value={form.height_cm} onChange={e => set('height_cm', Number(e.target.value))} min={140} max={220} />
      </div>
    </div>,

    // Step 2: Actividad
    <div key="2" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="section-label" style={{ marginBottom: 4 }}>Nivel de actividad</div>
      {ACTIVITY_OPTS.map(opt => (
        <button key={opt.value} onClick={() => set('activity', opt.value)} style={{
          padding: '16px',
          borderRadius: 12,
          border: `1.5px solid ${form.activity === opt.value ? '#e8ff47' : '#2a2a2a'}`,
          background: form.activity === opt.value ? 'rgba(232,255,71,0.08)' : '#181818',
          textAlign: 'left', cursor: 'pointer',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: form.activity === opt.value ? '#e8ff47' : '#f2f0ea' }}>{opt.label}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{opt.desc}</div>
        </button>
      ))}
    </div>,

    // Step 3: Objetivo
    <div key="3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="section-label" style={{ marginBottom: 4 }}>Tu objetivo</div>
      {GOAL_OPTS.map(opt => (
        <button key={opt.value} onClick={() => set('goal', opt.value)} style={{
          padding: '16px',
          borderRadius: 12,
          border: `1.5px solid ${form.goal === opt.value ? opt.color : '#2a2a2a'}`,
          background: form.goal === opt.value ? `${opt.color}14` : '#181818',
          textAlign: 'left', cursor: 'pointer',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: form.goal === opt.value ? opt.color : '#f2f0ea' }}>{opt.label}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{opt.desc}</div>
        </button>
      ))}
    </div>,
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '32px 20px 40px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 4, color: '#e8ff47' }}>CONFIGURA</div>
          <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 4, color: '#f2f0ea' }}>TU PERFIL</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>Paso {step + 1} de 4</div>
          {/* Progress */}
          <div style={{ marginTop: 12, height: 4, background: '#2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#e8ff47', width: `${((step + 1) / 4) * 100}%`, borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>

        {steps[step]}

        {error && (
          <div style={{ marginTop: 16, background: 'rgba(255,107,53,0.12)', border: '1.5px solid rgba(255,107,53,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b35' }}>
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              flex: 1, padding: '16px', borderRadius: 12, border: '1.5px solid #2a2a2a',
              background: 'transparent', color: '#666', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>
              ← Atrás
            </button>
          )}
          {step < 3 ? (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)} style={{ flex: 2 }}>
              SIGUIENTE →
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'GUARDANDO...' : '¡EMPEZAR! 🔥'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
