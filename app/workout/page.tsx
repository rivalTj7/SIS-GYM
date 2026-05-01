'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

const DAY_NAMES = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const REST_IDX = 6;

const GYM = [
  { name: 'Shoulder Press (Máquina)', sets: 4, reps: '10–12', videoId: 'qEwKCR5JCog', tip: 'Espalda pegada al respaldo. Empuja sin bloquear codos. Baja controlado 2–3 seg.' },
  { name: 'Press de Banca', sets: 4, reps: '10', videoId: 'rT7DgCr-3pg', tip: 'Agarre más ancho que hombros. Baja hasta rozar el pecho. Escápulas retraídas.' },
  { name: 'Jalón al Pecho (Polea)', sets: 4, reps: '12', videoId: 'CAwf7n6Luuc', tip: 'Baja al pecho, inclina 15° atrás. Junta escápulas al final.' },
  { name: 'Remo con Mancuerna', sets: 3, reps: '12 x brazo', videoId: 'roCP6wCXPqo', tip: 'Apoya rodilla y mano. Lleva el codo hacia el techo, contrae espalda.' },
  { name: 'Prensa de Piernas', sets: 4, reps: '12', videoId: 'GvRgijoJ2xY', tip: '¡Esto quema más calorías! Pies al ancho de hombros, baja 90°.' },
];

const HOME = [
  { name: 'Burpees', sets: 4, reps: '15 reps', videoId: 'dZgVxmf6jkA', tip: 'Plancha → flexión → salto explosivo. Mantén el ritmo.' },
  { name: 'Flexiones (Push-ups)', sets: 4, reps: '45 seg máx', videoId: 'IODxDxX7oi4', tip: 'Cuerpo recto. Pecho roza el suelo. Si fallas la forma, rodillas en tierra.' },
  { name: 'Zancadas (Lunges)', sets: 4, reps: '20 pasos', videoId: 'QOVaHwm-Q6U', tip: '10 por pierna. Rodilla trasera casi toca el suelo. Torso erguido.' },
  { name: 'Mountain Climbers', sets: 4, reps: '45 seg máx', videoId: 'nmwgirgXLYM', tip: 'Plancha alta. Lleva rodillas al pecho alternando. Caderas abajo.' },
  { name: 'Plancha Abdominal', sets: 4, reps: '1 min', videoId: 'ASdvN_XEl_c', tip: 'Codos bajo hombros. Contrae abdomen y glúteos. Respira.' },
];

const CIRCUMFERENCE = 175.9;

export default function WorkoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const todayIdx = (new Date().getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [dayMode, setDayMode] = useState<'gym' | 'home' | null>(null);
  const [showModeModal, setShowModeModal] = useState(todayIdx !== REST_IDX);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const [timerTotal, setTimerTotal] = useState(60);
  const [timerRemaining, setTimerRemaining] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [restActive, setRestActive] = useState(false);
  const [restRemaining, setRestRemaining] = useState(60);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [videoId, setVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [toast, setToast] = useState('');
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    setDayMode(null);
    setExpanded({});
    setSessionDone(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerRemaining(timerTotal);
    loadDay(selectedDay);
    if (selectedDay !== REST_IDX) setShowModeModal(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restRef.current) clearInterval(restRef.current);
    };
  }, []);

  function getStorageKey(day: number) {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((+d - +jan1) / 86400000) + jan1.getDay() + 1) / 7);
    return `burngt_${d.getFullYear()}_w${week}_d${day}`;
  }

  function loadDay(day: number) {
    try {
      const raw = localStorage.getItem(getStorageKey(day));
      setCompleted(raw ? JSON.parse(raw) : {});
    } catch { setCompleted({}); }
  }

  function saveCompleted(next: Record<number, boolean>) {
    try { localStorage.setItem(getStorageKey(selectedDay), JSON.stringify(next)); } catch {}
  }

  function toggleExercise(idx: number) {
    const next = { ...completed, [idx]: !completed[idx] };
    setCompleted(next);
    saveCompleted(next);
    if (next[idx]) { showToast('¡Serie completada! 💪'); startRest(); }
  }

  function toggleTimer() {
    if (timerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimerRunning(false);
    } else {
      setTimerRemaining(timerTotal);
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimerRemaining(r => {
          if (r <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerRunning(false);
            try { navigator.vibrate?.([200, 100, 200]); } catch {}
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
  }

  function setPreset(secs: number) {
    setTimerTotal(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerRemaining(secs);
  }

  function startRest() {
    if (!dayMode) return;
    setRestRemaining(timerTotal);
    setRestActive(true);
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestRemaining(r => {
        if (r <= 1) {
          if (restRef.current) clearInterval(restRef.current);
          setRestActive(false);
          try { navigator.vibrate?.([300, 100, 300]); } catch {}
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function skipRest() {
    if (restRef.current) clearInterval(restRef.current);
    setRestActive(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(''), 2500);
  }

  async function completeSession() {
    if (!dayMode) return;
    setSaving(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const sRes = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_key: DAY_NAMES[selectedDay], split_type: dayMode, mode: dayMode === 'gym' ? 'gym' : 'casa', session_date: dateStr }),
      });
      if (sRes.ok) {
        const { session } = await sRes.json();
        if (session?.id) {
          const sets = exercises.flatMap((ex, i) =>
            completed[i] ? [{ session_id: session.id, exercise_name: ex.name, set_number: 1, reps: null, weight_kg: null }] : []
          );
          if (sets.length > 0) {
            await fetch('/api/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sets }) });
          }
          await fetch(`/api/workouts/${session.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: true }) });
        }
      }
    } catch {}
    setSaving(false);
    setSessionDone(true);
    showToast('🏆 ¡SESIÓN COMPLETADA! Eres un beast.');
  }

  const isRest = selectedDay === REST_IDX;
  const exercises = dayMode === 'gym' ? GYM : dayMode === 'home' ? HOME : [];
  const accent = dayMode === 'home' ? '#ff6b35' : '#e8ff47';
  const doneCount = exercises.filter((_, i) => completed[i]).length;
  const pct = exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0;
  const offset = CIRCUMFERENCE * (1 - timerRemaining / timerTotal);
  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="font-bebas" style={{ fontSize: 28, letterSpacing: 3, color: '#e8ff47' }}>PLAN DE BATALLA</div>
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#666', textTransform: 'uppercase' }}>
          {['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'][selectedDay]}
        </div>
      </div>

      {/* Week strip */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {DAY_NAMES.map((name, i) => {
          const isSelected = i === selectedDay;
          const isToday = i === todayIdx;
          const isRestDay = i === REST_IDX;
          return (
            <button key={i} onClick={() => setSelectedDay(i)} style={{
              flexShrink: 0, minWidth: 56,
              background: isSelected ? 'rgba(232,255,71,0.08)' : '#111',
              border: `1.5px solid ${isSelected ? '#e8ff47' : isToday ? 'rgba(255,255,255,0.2)' : '#2a2a2a'}`,
              borderRadius: 12, padding: '10px 14px', textAlign: 'center', cursor: 'pointer',
              opacity: isRestDay ? 0.5 : 1,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isSelected ? '#e8ff47' : '#666' }}>{name}</div>
              <div style={{ fontSize: 18, marginTop: 4 }}>{isRestDay ? '😴' : '🏋️'}</div>
            </button>
          );
        })}
      </div>

      {/* Gym/Casa modal */}
      {showModeModal && !isRest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#666', marginBottom: 8 }}>SESIÓN — {DAY_NAMES[selectedDay]}</div>
          <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 2, marginBottom: 8, textAlign: 'center', color: '#f2f0ea' }}>¿VAS AL GYM HOY?</div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 32, textAlign: 'center', maxWidth: 280 }}>
            Elegí tu rutina. Podés cambiarla después.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
            <button onClick={() => { setDayMode('gym'); setShowModeModal(false); }} style={{
              background: '#e8ff47', color: '#000', border: 'none', borderRadius: 14, padding: '20px',
              fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 20, letterSpacing: 3, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              🏛️ SÍ, VOY AL GYM
            </button>
            <button onClick={() => { setDayMode('home'); setShowModeModal(false); }} style={{
              background: '#1a1a1a', color: '#ff6b35', border: '1.5px solid #ff6b35', borderRadius: 14, padding: '20px',
              fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 20, letterSpacing: 3, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              🏠 NO, ME QUEDO EN CASA
            </button>
            <button onClick={() => setShowModeModal(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isRest ? (
        <div style={{ margin: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>🛌</div>
          <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 2, marginTop: 16 }}>DÍA DE DESCANSO</div>
          <div style={{ color: '#666', fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
            El músculo crece cuando descansas.<br />Camina suave o simplemente relájate.
          </div>
        </div>
      ) : !dayMode ? (
        <div style={{ margin: '40px 20px', textAlign: 'center' }}>
          <div style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>Elegí tu modo para ver la rutina de hoy.</div>
          <button onClick={() => setShowModeModal(true)} style={{ background: '#e8ff47', color: '#000', border: 'none', borderRadius: 10, padding: '14px 28px', fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 16, letterSpacing: 2, cursor: 'pointer' }}>
            ELEGIR MODO
          </button>
        </div>
      ) : (
        <>
          {/* Session badge */}
          <div style={{ margin: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 13, letterSpacing: 2,
              padding: '6px 14px', borderRadius: 6, border: `1.5px solid ${accent}`, color: accent,
              background: dayMode === 'gym' ? 'rgba(232,255,71,0.06)' : 'rgba(255,107,53,0.06)',
            }}>
              {dayMode === 'gym' ? '🏛️ GYM — FUERZA' : '🔥 CASA — QUEMA-GRASA'}
            </div>
            <button onClick={() => setShowModeModal(true)} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>
              Cambiar
            </button>
          </div>

          {/* Timer */}
          <div style={{ margin: '20px 20px 0', background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>DESCANSO ENTRE SERIES</div>
              <div className="font-bebas" style={{ fontSize: 48, letterSpacing: 2, lineHeight: 1, color: timerRemaining <= 10 && timerRunning ? '#ff6b35' : '#e8ff47' }}>
                {fmtTime(timerRemaining)}
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                {timerRunning ? 'Descansando...' : timerRemaining === 0 ? '¡A la siguiente serie!' : 'Presiona START'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" stroke="#2a2a2a" />
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5"
                  stroke={timerRemaining <= 10 && timerRunning ? '#ff6b35' : '#e8ff47'}
                  strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
              </svg>
              <button onClick={toggleTimer} style={{ background: timerRunning ? '#ff6b35' : '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                {timerRunning ? 'STOP' : 'START'}
              </button>
            </div>
          </div>

          {/* Timer presets */}
          <div style={{ margin: '10px 20px 0', display: 'flex', gap: 8 }}>
            {[60, 90, 120, 180].map(s => (
              <button key={s} onClick={() => setPreset(s)} style={{
                flex: 1, background: timerTotal === s ? 'rgba(232,255,71,0.05)' : '#111',
                border: `1.5px solid ${timerTotal === s ? '#e8ff47' : '#2a2a2a'}`,
                color: timerTotal === s ? '#e8ff47' : '#f2f0ea',
                borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>
                {s < 120 ? `${s}s` : `${s / 60}min`}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div style={{ margin: '20px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="section-label">PROGRESO SESIÓN</div>
              <div className="font-bebas" style={{ fontSize: 20, color: '#e8ff47' }}>{pct}%</div>
            </div>
            <div style={{ background: '#111', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#e8ff47', width: `${pct}%`, borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>

          {/* Exercises */}
          <div style={{ margin: '20px 20px 0' }}>
            <div className="section-label" style={{ marginBottom: 12 }}>
              {dayMode === 'gym' ? 'BLOQUES DE ENTRENAMIENTO' : 'CIRCUITO NON-STOP'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exercises.map((ex, i) => {
                const done = !!completed[i];
                const isExpanded = !!expanded[i];
                return (
                  <div key={i} onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))} style={{
                    background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 14, padding: 16,
                    cursor: 'pointer', opacity: done ? 0.55 : 1, position: 'relative', overflow: 'hidden', transition: 'opacity 0.2s',
                  }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: done ? '#444' : accent }} />
                    <div style={{ paddingLeft: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, paddingRight: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#f2f0ea' }}>{ex.name}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: `${accent}18`, color: `${accent}cc`, borderRadius: 6, padding: '3px 8px' }}>{ex.sets} series</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: `${accent}18`, color: `${accent}cc`, borderRadius: 6, padding: '3px 8px' }}>{ex.reps}</span>
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); toggleExercise(i); }} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        border: `2px solid ${done ? '#555' : '#2a2a2a'}`,
                        background: done ? '#555' : 'transparent',
                        color: done ? '#0a0a0a' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                      }}>✓</button>
                    </div>
                    {isExpanded && (
                      <div style={{ paddingLeft: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a2a' }}>
                        <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>💡 {ex.tip}</div>
                        <button
                          onClick={e => { e.stopPropagation(); setVideoId(ex.videoId); setVideoTitle(ex.name); }}
                          style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: '1.5px solid #2a2a2a', color: '#666', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          ▶ Ver técnica
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete */}
          <div style={{ padding: '28px 20px 0' }}>
            <button className="btn-primary" onClick={completeSession} disabled={pct < 100 || saving || sessionDone}
              style={{ background: sessionDone ? '#2a2a2a' : undefined, color: sessionDone ? '#666' : undefined }}>
              {saving ? 'GUARDANDO...' : sessionDone ? '✓ SESIÓN COMPLETADA' : 'COMPLETAR SESIÓN'}
            </button>
          </div>
        </>
      )}

      {/* Rest overlay */}
      {restActive && (
        <div onClick={skipRest} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#666', marginBottom: 12 }}>DESCANSANDO</div>
          <div className="font-bebas" style={{ fontSize: 120, lineHeight: 1, letterSpacing: -2, color: restRemaining <= 10 ? '#ff6b35' : '#e8ff47' }}>{restRemaining}</div>
          <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>¡Buen trabajo! Descansá {timerTotal} segundos</div>
          <button onClick={e => { e.stopPropagation(); skipRest(); }} style={{ marginTop: 32, background: 'transparent', border: '1.5px solid #2a2a2a', color: '#666', borderRadius: 10, padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            SALTAR DESCANSO →
          </button>
        </div>
      )}

      {/* Video modal */}
      {videoId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="font-bebas" style={{ fontSize: 20, letterSpacing: 2 }}>{videoTitle}</div>
            <button onClick={() => setVideoId('')} style={{ background: '#111', border: '1.5px solid #2a2a2a', color: '#666', borderRadius: 8, width: 36, height: 36, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ width: '100%', maxWidth: 640, aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
            <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#e8ff47', color: '#0a0a0a', padding: '12px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13, zIndex: 300, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
