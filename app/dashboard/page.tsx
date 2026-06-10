'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

const PLAN = [
  { day: 'LUN', label: 'PECHO · HOMBROS · TRÍCEPS',        rest: false },
  { day: 'MAR', label: 'ESPALDA · BÍCEPS · ANTEBRAZO',     rest: false },
  { day: 'MIÉ', label: 'PIERNAS · GLÚTEOS · PANTORRILLAS', rest: false },
  { day: 'JUE', label: 'PECHO · HOMBROS · TRÍCEPS (B)',    rest: false },
  { day: 'VIE', label: 'ESPALDA · BÍCEPS (B)',             rest: false },
  { day: 'SÁB', label: 'PIERNAS · CORE',                   rest: false },
  { day: 'DOM', label: 'DESCANSO ACTIVO',                   rest: true  },
];

const TODAY_IDX  = (new Date().getDay() + 6) % 7;
const TODAY_PLAN = PLAN[TODAY_IDX];
const TODAY_ISO  = new Date().toISOString().slice(0, 10);
const DATE_FMT   = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

type Totals = { kcal: number; protein_g: number; carbs_g: number; fat_g: number };

export default function DashboardPage() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/nutrition?date=${TODAY_ISO}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.totals && setTotals(d.totals));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const goalKcal  = profile?.goal_kcal ?? 0;
  const goalProt  = profile?.goal_prot ?? 0;
  const goalCarb  = profile?.goal_carb ?? 0;
  const kcalNow   = totals?.kcal      ?? 0;
  const protNow   = totals?.protein_g ?? 0;
  const carbNow   = totals?.carbs_g   ?? 0;
  const kcalPct   = goalKcal > 0 ? Math.min(100, Math.round((kcalNow / goalKcal) * 100)) : 0;
  const protPct   = goalProt > 0 ? Math.min(100, Math.round((protNow / goalProt) * 100)) : 0;
  const remaining = Math.max(0, goalKcal - kcalNow);

  // Recomp coaching stats derived from profile
  const weightKg    = profile?.weight_kg ?? 0;
  const protTarget  = weightKg > 0 ? Math.round(weightKg * 2.2) : 0;
  const tdee        = profile?.tdee ?? 0;
  const recompKcal  = profile?.goal_kcal ?? 0;
  const goalIsRecomp = profile?.goal === 'mant';

  return (
    <div className="page-root">

      {/* ── Header ── */}
      <div className="flex justify-between items-start px-5 pt-12 pb-2">
        <div>
          <p className="section-label mb-1">{DATE_FMT.format(new Date())}</p>
          <h1
            className="font-bebas text-[42px] leading-none tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #c8ff00, #ffee00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {user.name.split(' ')[0].toUpperCase()}
          </h1>
        </div>
        <button
          onClick={logout}
          className="mt-2 px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#555] transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}
        >
          Salir
        </button>
      </div>

      {/* ── Today's Workout ── */}
      <div
        className="mx-5 mt-4 rounded-2xl overflow-hidden"
        style={{
          background: TODAY_PLAN.rest
            ? 'linear-gradient(135deg, rgba(61,220,132,0.07), rgba(61,220,132,0.02))'
            : 'linear-gradient(135deg, rgba(200,255,0,0.09), rgba(200,255,0,0.02))',
          border: `1.5px solid ${TODAY_PLAN.rest ? 'rgba(61,220,132,0.18)' : 'rgba(200,255,0,0.18)'}`,
        }}
      >
        <div className="px-5 pt-5 pb-5">
          <p className="section-label mb-2">HOY — {TODAY_PLAN.day}</p>

          {TODAY_PLAN.rest ? (
            <>
              <p
                className="font-bebas text-3xl tracking-wider mb-1"
                style={{ color: '#3ddc84' }}
              >
                DESCANSO ACTIVO
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Movilidad, estiramiento y recuperación. El músculo crece hoy.
              </p>
            </>
          ) : (
            <>
              <p className="font-bebas text-2xl tracking-wider leading-tight text-[#f2f0ea] mb-3">
                {TODAY_PLAN.label}
              </p>
              <Link
                href="/workout"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-[0.2em] uppercase text-[#0a0a0a] no-underline active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #c8ff00, #aadc00)',
                  boxShadow: '0 4px 20px rgba(200,255,0,0.25)',
                }}
              >
                IR A ENTRENAR →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Recomp Coach Card ── */}
      {goalIsRecomp && weightKg > 0 && (
        <div
          className="mx-5 mt-3 rounded-2xl p-4"
          style={{ background: 'rgba(255,107,107,0.04)', border: '1.5px solid rgba(255,107,107,0.12)' }}
        >
          <p className="section-label mb-3" style={{ color: 'rgba(255,107,107,0.6)' }}>PROTOCOLO RECOMPOSICIÓN</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Proteína/día', val: `${protTarget}g`, sub: 'mín. absoluto', color: '#ff6b6b' },
              { label: 'TDEE',         val: `${tdee}`,        sub: 'kcal base',    color: 'rgba(255,255,255,0.5)' },
              { label: 'Objetivo',     val: `${recompKcal}`,  sub: 'kcal recomp',  color: '#c8ff00' },
            ].map(s => (
              <div key={s.label} className="text-center py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-bebas text-xl leading-none" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[8px] font-bold uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>{s.label}</p>
                <p className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.15)' }}>{s.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
            PPL ×2 · 6 días · RIR 2 en cada serie · Proteína todos los días sin excepción
          </p>
        </div>
      )}

      {/* ── Nutrition Snapshot ── */}
      <div
        className="glass-card mx-5 mt-3 p-5"
      >
        <div className="flex justify-between items-center mb-3">
          <p className="section-label">NUTRICIÓN HOY</p>
          <Link
            href="/nutrition"
            className="text-[10px] font-bold no-underline"
            style={{ color: '#c8ff00' }}
          >
            Ver todo →
          </Link>
        </div>

        {goalKcal > 0 ? (
          <>
            {/* Protein — Priority #1 for body recomposition */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold tracking-widest uppercase" style={{ color: '#ff6b6b' }}>Proteína</span>
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', letterSpacing: '0.5px' }}
                  >
                    PRIORIDAD #1
                  </span>
                </div>
                <span className="text-[13px] font-extrabold" style={{ color: protPct >= 100 ? '#3ddc84' : '#ff6b6b' }}>
                  {Math.round(protNow)}g{' '}
                  <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>/ {goalProt}g</span>
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${protPct}%`,
                    background: protPct >= 100 ? 'linear-gradient(90deg,#3ddc84,#2bb868)' : 'linear-gradient(90deg,#ff6b6b,#ff4d4d)',
                    boxShadow: protPct >= 100 ? '0 0 8px rgba(61,220,132,0.5)' : '0 0 6px rgba(255,107,107,0.35)',
                  }}
                />
              </div>
            </div>

            {/* Calorie bar (secondary) */}
            <div className="flex justify-between text-[10px] font-bold mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span>{kcalNow} kcal</span>
              <span>/ {goalKcal}</span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden mb-4"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${kcalPct}%`,
                  background: kcalPct >= 100 ? '#ff6b6b' : 'linear-gradient(90deg, #c8ff00, #aadc00)',
                  boxShadow: kcalPct >= 100 ? 'none' : '0 0 6px rgba(200,255,0,0.3)',
                }}
              />
            </div>

            {/* Secondary macros */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Carbos',   val: Math.round(carbNow), unit: 'g',    color: '#4daaff' },
                { label: 'Restante', val: remaining,           unit: 'kcal', color: '#c8ff00' },
              ].map(m => (
                <div
                  key={m.label}
                  className="text-center py-3 px-2 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="font-bebas text-xl leading-none" style={{ color: m.color }}>
                    {m.val}
                    <span className="text-sm">{m.unit}</span>
                  </p>
                  <p className="text-[8px] font-bold uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/setup" className="font-bold no-underline" style={{ color: '#c8ff00' }}>
              Configura tu perfil
            </Link>{' '}
            para ver tus objetivos de calorías y macros.
          </p>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="mx-5 mt-5">
        <p className="section-label mb-3">ACCESO RÁPIDO</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/workout',   emoji: '💪', label: 'Entrenar',  color: '#c8ff00' },
            { href: '/nutrition', emoji: '🥗', label: 'Nutrición', color: '#4daaff' },
            { href: '/progress',  emoji: '📊', label: 'Progreso',  color: '#3ddc84' },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl no-underline active:scale-95 transition-transform"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1.5px solid rgba(255,255,255,0.07)',
              }}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                {a.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Weekly strip ── */}
      <div className="mx-5 mt-5">
        <p className="section-label mb-3">SEMANA</p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {PLAN.map((d, i) => {
            const isToday = i === TODAY_IDX;
            return (
              <div
                key={i}
                className="flex-shrink-0 flex flex-col items-center gap-1 py-3 rounded-xl"
                style={{
                  minWidth: 48,
                  background: isToday ? 'rgba(200,255,0,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isToday ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <span
                  className="font-bebas text-base tracking-wider"
                  style={{ color: isToday ? '#c8ff00' : 'rgba(255,255,255,0.35)' }}
                >
                  {d.day}
                </span>
                <span className="text-base leading-none">{d.rest ? '😴' : '🏋️'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Principles ── */}
      <div className="mx-5 mt-5">
        <p className="section-label mb-3">RECOMPOSICIÓN CORPORAL</p>
        <div className="flex flex-col gap-2">
          {[
            { icon: '🥩', title: 'Proteína: 2g por kg de peso',       desc: 'Es el único macro donde NO hay recomposición si falla. Sin proteína suficiente, el músculo no crece aunque entrenes perfecto.' },
            { icon: '📈', title: 'Sobrecarga progresiva cada semana', desc: 'Más peso o más reps que la semana anterior. Si la fuerza no sube, la composición corporal no cambia.' },
            { icon: '😴', title: 'El sueño es el entrenamiento',       desc: 'La síntesis proteica muscular ocurre durante las primeras 3 horas de sueño profundo. 8h no es opcional.' },
          ].map(p => (
            <div key={p.title} className="glass-card flex gap-3 p-4">
              <span className="text-xl leading-none mt-0.5 flex-shrink-0">{p.icon}</span>
              <div>
                <p className="text-[13px] font-bold text-[#f2f0ea] mb-0.5">{p.title}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
