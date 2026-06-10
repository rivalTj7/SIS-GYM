'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const ACTIVITY_OPTS = [
  { value: 'sed', label: 'Sedentario',  desc: 'Poco o nada de ejercicio' },
  { value: 'med', label: 'Moderado',    desc: '3–5 días/semana — PPL x2' },
  { value: 'hi',  label: 'Intenso',     desc: '6–7 días/semana + cardio' },
];

const GOAL_OPTS = [
  { value: 'mant', label: 'Recomposición corporal', desc: 'Ligero déficit –200 kcal · perder grasa + ganar músculo', color: '#e8ff47', recommended: true  },
  { value: 'def',  label: 'Quemar grasa',           desc: 'Déficit –400 kcal · pérdida de grasa prioritaria',       color: '#ff6b35', recommended: false },
  { value: 'vol',  label: 'Ganar músculo',           desc: 'Superávit +350 kcal · bulk limpio',                     color: '#4daaff', recommended: false },
  { value: 'agr',  label: 'Déficit agresivo',        desc: 'Déficit –500 kcal · pérdida rápida (no recomendado)',    color: '#ff4d4d', recommended: false },
];

type BaseForm = { sex: string; age: number; weight_kg: number; height_cm: number; activity: string; goal: string };
type TanitaForm = { body_fat_pct: string; muscle_kg: string; bone_kg: string; water_pct: string; visceral_fat: string; metabolic_age: string };

const EMPTY_TANITA: TanitaForm = { body_fat_pct: '', muscle_kg: '', bone_kg: '', water_pct: '', visceral_fat: '', metabolic_age: '' };

function label(text: string) {
  return <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#666', display: 'block', marginBottom: 8 }}>{text}</label>;
}

export default function SetupPage() {
  const { refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BaseForm>({ sex: 'm', age: 26, weight_kg: 80, height_cm: 171, activity: 'med', goal: 'mant' });
  const [tanita, setTanita] = useState<TanitaForm>(EMPTY_TANITA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, val: string | number) { setForm(f => ({ ...f, [key]: val })); }
  function setT(key: keyof TanitaForm, val: string) { setTanita(f => ({ ...f, [key]: val })); }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        ...form,
        age: Number(form.age),
        weight_kg: Number(form.weight_kg),
        height_cm: Number(form.height_cm),
      };
      // Incluir datos Tanita solo si se ingresaron
      if (tanita.body_fat_pct)  payload.body_fat_pct  = Number(tanita.body_fat_pct);
      if (tanita.muscle_kg)     payload.muscle_kg     = Number(tanita.muscle_kg);
      if (tanita.bone_kg)       payload.bone_kg       = Number(tanita.bone_kg);
      if (tanita.water_pct)     payload.water_pct     = Number(tanita.water_pct);
      if (tanita.visceral_fat)  payload.visceral_fat  = Number(tanita.visceral_fat);
      if (tanita.metabolic_age) payload.metabolic_age = Number(tanita.metabolic_age);

      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar');
      await refreshProfile();
      router.replace('/dashboard');
    } catch {
      setError('No se pudo guardar el perfil. Intenta de nuevo.');
      setLoading(false);
    }
  }

  const TOTAL_STEPS = 5;

  const steps = [
    // Step 0: Sexo + Edad
    <div key="0" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div className="section-label" style={{ marginBottom: 14 }}>Sexo biológico</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[{ v: 'm', l: '♂ Masculino' }, { v: 'f', l: '♀ Femenino' }].map(opt => (
            <button key={opt.v} onClick={() => set('sex', opt.v)} style={{
              padding: '16px', borderRadius: 12, cursor: 'pointer',
              border: `1.5px solid ${form.sex === opt.v ? '#e8ff47' : '#2a2a2a'}`,
              background: form.sex === opt.v ? 'rgba(232,255,71,0.08)' : '#181818',
              color: form.sex === opt.v ? '#e8ff47' : '#f2f0ea',
              fontSize: 15, fontWeight: 700,
            }}>{opt.l}</button>
          ))}
        </div>
      </div>
      <div>
        {label('Edad')}
        <input type="number" value={form.age} onChange={e => set('age', Number(e.target.value))} min={15} max={80} />
      </div>
    </div>,

    // Step 1: Peso + Altura
    <div key="1" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        {label('Peso actual (kg)')}
        <input type="number" value={form.weight_kg} onChange={e => set('weight_kg', Number(e.target.value))} min={40} max={200} step={0.1} />
      </div>
      <div>
        {label('Altura (cm)')}
        <input type="number" value={form.height_cm} onChange={e => set('height_cm', Number(e.target.value))} min={140} max={220} />
      </div>
    </div>,

    // Step 2: Actividad
    <div key="2" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="section-label" style={{ marginBottom: 4 }}>Nivel de actividad</div>
      {ACTIVITY_OPTS.map(opt => (
        <button key={opt.value} onClick={() => set('activity', opt.value)} style={{
          padding: '16px', borderRadius: 12, border: `1.5px solid ${form.activity === opt.value ? '#e8ff47' : '#2a2a2a'}`,
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
          padding: '16px', borderRadius: 12, cursor: 'pointer',
          border: `1.5px solid ${form.goal === opt.value ? opt.color : '#2a2a2a'}`,
          background: form.goal === opt.value ? `${opt.color}14` : '#181818',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: form.goal === opt.value ? opt.color : '#f2f0ea' }}>{opt.label}</span>
            {opt.recommended && (
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(232,255,71,0.12)', color: '#e8ff47', letterSpacing: 1 }}>
                RECOMENDADO
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{opt.desc}</div>
        </button>
      ))}
    </div>,

    // Step 4: Composición corporal (Tanita — opcional)
    <div key="4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'rgba(200,255,0,0.04)', border: '1.5px solid rgba(200,255,0,0.12)', borderRadius: 14, padding: '12px 14px', marginBottom: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#c8ff00', letterSpacing: 1, marginBottom: 4 }}>
          DATOS DE BÁSCULA INTELIGENTE (OPCIONAL)
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          Si tenés una Tanita u otra báscula con análisis corporal, ingresá los datos aquí para un seguimiento más preciso de tu recomposición.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          {label('% Grasa corporal')}
          <input type="number" placeholder="ej: 23.04" value={tanita.body_fat_pct} onChange={e => setT('body_fat_pct', e.target.value)} min={1} max={60} step={0.1} />
        </div>
        <div>
          {label('Masa muscular (kg)')}
          <input type="number" placeholder="ej: 58.78" value={tanita.muscle_kg} onChange={e => setT('muscle_kg', e.target.value)} min={10} max={150} step={0.1} />
        </div>
        <div>
          {label('% Agua corporal')}
          <input type="number" placeholder="ej: 54.41" value={tanita.water_pct} onChange={e => setT('water_pct', e.target.value)} min={20} max={80} step={0.1} />
        </div>
        <div>
          {label('Grasa visceral')}
          <input type="number" placeholder="ej: 6.31" value={tanita.visceral_fat} onChange={e => setT('visceral_fat', e.target.value)} min={1} max={20} step={0.1} />
        </div>
        <div>
          {label('Masa ósea (kg)')}
          <input type="number" placeholder="ej: 3.09" value={tanita.bone_kg} onChange={e => setT('bone_kg', e.target.value)} min={0.5} max={10} step={0.1} />
        </div>
        <div>
          {label('Edad metabólica')}
          <input type="number" placeholder="ej: 40" value={tanita.metabolic_age} onChange={e => setT('metabolic_age', e.target.value)} min={10} max={90} />
        </div>
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '32px 20px 40px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 4, color: '#e8ff47' }}>CONFIGURA</div>
          <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 4, color: '#f2f0ea' }}>TU PERFIL</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
            Paso {step + 1} de {TOTAL_STEPS}
            {step === TOTAL_STEPS - 1 && <span style={{ color: '#555', marginLeft: 6 }}>· Datos de báscula (opcional)</span>}
          </div>
          <div style={{ marginTop: 12, height: 4, background: '#2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#e8ff47', width: `${((step + 1) / TOTAL_STEPS) * 100}%`, borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>

        {steps[step]}

        {error && (
          <div style={{ marginTop: 16, background: 'rgba(255,107,53,0.12)', border: '1.5px solid rgba(255,107,53,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b35' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              flex: 1, padding: '16px', borderRadius: 12, border: '1.5px solid #2a2a2a',
              background: 'transparent', color: '#666', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>
              ← Atrás
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)} style={{ flex: 2 }}>
              SIGUIENTE →
            </button>
          ) : (
            <>
              <button
                onClick={() => { void handleSubmit(); }}
                disabled={loading}
                style={{
                  flex: 1, padding: '16px', borderRadius: 12,
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: 'rgba(255,255,255,0.4)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Saltar
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
                {loading ? 'GUARDANDO...' : '¡EMPEZAR! 🔥'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
