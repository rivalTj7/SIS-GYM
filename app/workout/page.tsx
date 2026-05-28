'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

// ─────────────────────────────────────────────────────────────
// BURN GT PRO — SPLIT PPL × 2 (Push / Pull / Legs)
// LUN: Push A  · MAR: Pull A  · MIÉ: Legs A
// JUE: Push B  · VIE: Pull B  · SÁB: Legs B + Core  · DOM: Rest
// ─────────────────────────────────────────────────────────────

type Ex = { name: string; sets: string; reps: string; rest: number; videoId: string; tip: string; muscle: string };
type Day = { day: string; label: string; focus: string; rest: boolean; gym: Ex[]; home: Ex[] };

const PLAN: Day[] = [

  // ── LUN — PUSH A ─────────────────────────────────────────
  {
    day: 'LUN', label: 'PUSH A', focus: 'Pecho · Hombros · Tríceps', rest: false,
    gym: [
      { name: 'Press de Banca con Barra',       sets: '4', reps: '5–6',   rest: 180, videoId: 'rT7DgCr-3pg', muscle: 'Pecho',            tip: 'Escápulas retraídas y fijas. Barra baja hasta rozar el pecho. Empuje explosivo sin rebotar.' },
      { name: 'Press Inclinado Mancuernas',      sets: '4', reps: '8–10',  rest: 90,  videoId: '8iPEnn-ltC8', muscle: 'Pecho superior',   tip: 'Banco a 30°, no más. Baja hasta sentir el estiramiento del pecho superior. No rebotes abajo.' },
      { name: 'Press Arnold',                    sets: '3', reps: '10–12', rest: 75,  videoId: 'qEwKCR5JCog', muscle: 'Hombros',          tip: 'Empieza palmas hacia ti, gira al empujar. Activa las 3 cabezas del deltoides en un solo movimiento.' },
      { name: 'Elevaciones Laterales en Cable',  sets: '4', reps: '15–20', rest: 45,  videoId: 'FeJbvGm_09k', muscle: 'Deltoides lateral', tip: 'Sube solo hasta paralelo. Baja en 2 seg. La polea mantiene tensión en todo el rango, mejor que mancuernas.' },
      { name: 'Extensión en Polea (cuerda)',     sets: '3', reps: '12–15', rest: 60,  videoId: 'vB5OHsJ3EMc', muscle: 'Tríceps',          tip: 'Codos pegados al cuerpo. Separa la cuerda al final para máxima contracción. No permitas que los codos se muevan.' },
    ],
    home: [
      { name: 'Flexiones con Pausa 3-1-1',             sets: '4', reps: '10–15', rest: 90, videoId: 'IODxDxX7oi4', muscle: 'Pecho',            tip: 'Baja en 3 seg, pausa 1 seg en el fondo, explota al subir. El tempo multiplica el estímulo sin añadir peso.' },
      { name: 'Flexiones Inclinadas (pies en silla)',   sets: '3', reps: '10–12', rest: 75, videoId: 'IODxDxX7oi4', muscle: 'Pecho superior',   tip: 'Pies en silla a 45 cm. Activa el pecho superior exactamente igual que el press inclinado.' },
      { name: 'Pike Push-ups (pies elevados)',          sets: '4', reps: '10–12', rest: 75, videoId: 'sposDXWEB0A', muscle: 'Hombros',          tip: 'Caderas altas formando una V. Cabeza baja entre los brazos. Equivale al press militar con carga corporal.' },
      { name: 'Elevaciones Laterales con Botellas',     sets: '3', reps: '20',    rest: 45, videoId: 'FeJbvGm_09k', muscle: 'Deltoides lateral', tip: 'Botellas de 1.5L. Sube hasta paralelo. Baja en 2 seg. 20 reps compensan el peso bajo con más volumen.' },
      { name: 'Dips en Silla',                          sets: '3', reps: '12–15', rest: 60, videoId: 'l4kQd9eWclE', muscle: 'Tríceps',          tip: 'Cuerpo completamente vertical para atacar el tríceps. Baja hasta 90°. Si te inclinas adelante activa el pecho.' },
    ],
  },

  // ── MAR — PULL A ─────────────────────────────────────────
  {
    day: 'MAR', label: 'PULL A', focus: 'Espalda · Bíceps', rest: false,
    gym: [
      { name: 'Dominadas (o Jalón al Pecho)',    sets: '4', reps: 'al fallo (mín 4)', rest: 180, videoId: 'eGo4IYlbE5g', muscle: 'Dorsal',       tip: 'Baja hasta extensión completa. Lleva el pecho a la barra. Si haces +8 reps, añade lastre para progresar.' },
      { name: 'Remo con Barra (Bent-Over Row)',   sets: '4', reps: '8–10',            rest: 90,  videoId: 'GZbfZ033f74', muscle: 'Espalda media', tip: 'Torso a 45°. Barra toca el abdomen bajo. No uses inercia del torso. Controlá la bajada en 2 seg.' },
      { name: 'Jalón al Pecho Agarre Neutro',     sets: '3', reps: '10–12',           rest: 75,  videoId: 'CAwf7n6Luuc', muscle: 'Dorsal',        tip: 'Palmas enfrentadas. Inclina el torso 15° atrás al bajar. Junta las escápulas al final del movimiento.' },
      { name: 'Curl con Barra de Pie',            sets: '3', reps: '8–10',            rest: 75,  videoId: 'av7-8igSXTs', muscle: 'Bíceps',        tip: 'Codos fijos al costado del torso. Rango completo. Baja en 3 seg. Sin balancear el cuerpo.' },
      { name: 'Curl Martillo con Mancuernas',     sets: '3', reps: '10–12',           rest: 60,  videoId: 'TwD-YGVP4Bk', muscle: 'Braquial',      tip: 'Agarre neutro (pulgar arriba). Trabaja el braquial que da grosor al brazo. Codos completamente fijos.' },
    ],
    home: [
      { name: 'Dominadas o Inverted Row',         sets: '4', reps: 'al fallo / 12',  rest: 120, videoId: 'eGo4IYlbE5g', muscle: 'Dorsal',        tip: 'Usá lo que tengas disponible. Rango completo siempre. En inverted row: más horizontal = más difícil.' },
      { name: 'Remo con Mochila Unilateral',       sets: '4', reps: '12 × lado',      rest: 75,  videoId: 'roCP6wCXPqo', muscle: 'Espalda media',  tip: 'Mochila con libros. Lleva el codo al techo. Contrae la espalda 1 seg en el tope antes de bajar.' },
      { name: 'Superman con Pausa',                sets: '3', reps: '15',             rest: 45,  videoId: 'z6PJMT2y8GQ', muscle: 'Espalda baja',   tip: 'Boca abajo, sube brazos y piernas simultáneamente. Mantén 2 seg. Activa toda la cadena posterior.' },
      { name: 'Curl con Mochila',                  sets: '3', reps: '12–15',          rest: 60,  videoId: 'av7-8igSXTs', muscle: 'Bíceps',         tip: 'Codos fijos al cuerpo. Gira la muñeca al subir. Baja en 3 seg para más estímulo sin más peso.' },
      { name: 'Curl Inverso con Botella',          sets: '3', reps: '15–20',          rest: 45,  videoId: 'TwD-YGVP4Bk', muscle: 'Antebrazo',      tip: 'Agarre con el dorso de la mano hacia arriba. Trabaja el braquiorradial y los extensores del antebrazo.' },
    ],
  },

  // ── MIÉ — LEGS A ─────────────────────────────────────────
  {
    day: 'MIÉ', label: 'LEGS A', focus: 'Cuádriceps · Glúteos · Pantorrillas', rest: false,
    gym: [
      { name: 'Sentadilla con Barra',             sets: '4', reps: '5–8',   rest: 180, videoId: 'ultWZbUMPL8', muscle: 'Cuádriceps',     tip: 'Pecho arriba, rodillas siguen los pies. Baja hasta paralelo o más profundo. La profundidad activa más glúteo.' },
      { name: 'Prensa de Piernas',                sets: '4', reps: '10–12', rest: 90,  videoId: 'GvRgijoJ2xY', muscle: 'Cuádriceps',     tip: 'Pies al ancho de hombros. Baja hasta 90°. No despegues la espalda baja. No bloquees rodillas arriba.' },
      { name: 'Hip Thrust con Barra',             sets: '4', reps: '10–12', rest: 90,  videoId: 'SEdqd1n0cvg', muscle: 'Glúteos',        tip: 'Espalda sobre el banco. Empuja desde los talones. Contrae el glúteo 2 seg arriba. No hiperextendas la espalda baja.' },
      { name: 'Curl de Isquiotibiales (máquina)', sets: '3', reps: '12',    rest: 60,  videoId: 'Orxowest56U', muscle: 'Isquiotibiales', tip: 'Baja en 3 seg, el músculo crece más en la fase excéntrica. Extensión completa entre repeticiones.' },
      { name: 'Pantorrillas de Pie (con barra)',  sets: '4', reps: '15–20', rest: 45,  videoId: 'gwLzBJYoWlQ', muscle: 'Pantorrillas',   tip: 'Rango completo: talón abajo del borde, punta al máximo arriba. Pausa 2 seg en el tope.' },
    ],
    home: [
      { name: 'Sentadilla Búlgara',               sets: '4', reps: '10 × pierna', rest: 90, videoId: 'QOVaHwm-Q6U', muscle: 'Cuádriceps / Glúteos', tip: 'Pie trasero en silla. Para más glúteo, inclina levemente el torso al frente. Bajada controlada en 3 seg.' },
      { name: 'Hip Thrust Elevado (sofá)',         sets: '4', reps: '15–20',       rest: 75, videoId: 'OUgsJ8-Vi0E', muscle: 'Glúteos',               tip: 'Hombros en el borde del sofá. Pausa 2 seg arriba con glúteo contraído. Empuja siempre desde los talones.' },
      { name: 'Sentadilla con Salto',              sets: '3', reps: '15',          rest: 60, videoId: 'CVaEhXotL7M', muscle: 'Cuádriceps / Cardio',    tip: 'Profundidad completa en cada repetición. Explosión total al subir. Aterriza con rodillas dobladas.' },
      { name: 'Zancadas Alternadas',               sets: '3', reps: '20 pasos',    rest: 60, videoId: 'QOVaHwm-Q6U', muscle: 'Cuádriceps / Glúteos',   tip: '10 pasos por pierna. Rodilla trasera casi toca el suelo. Torso erguido y estable durante todo.' },
      { name: 'Pantorrillas en Escalón',           sets: '4', reps: '20',          rest: 30, videoId: 'gwLzBJYoWlQ', muscle: 'Pantorrillas',            tip: 'Rango completo obligatorio. Pausa 2 seg arriba. Talón abajo del nivel entre repeticiones.' },
    ],
  },

  // ── JUE — PUSH B ─────────────────────────────────────────
  {
    day: 'JUE', label: 'PUSH B', focus: 'Pecho · Hombros · Tríceps (variantes)', rest: false,
    gym: [
      { name: 'Press Banca Inclinado con Barra',  sets: '4', reps: '8–12',  rest: 120, videoId: '8iPEnn-ltC8', muscle: 'Pecho superior',    tip: 'Banco a 30°. Barra baja a la parte alta del pecho. Más de 45° activa más hombro que pecho.' },
      { name: 'Press Banca con Mancuernas',       sets: '4', reps: '10–12', rest: 90,  videoId: 'rT7DgCr-3pg', muscle: 'Pecho',             tip: 'Mayor rango que la barra. Baja hasta sentir el estiramiento completo del pecho en cada repetición.' },
      { name: 'Elevaciones Laterales Mancuernas', sets: '4', reps: '12–15', rest: 45,  videoId: 'FeJbvGm_09k', muscle: 'Deltoides lateral',  tip: 'Sube hasta paralelo. Baja en 2 seg. Sin impulso. La diferencia vs el lunes: mancuerna en lugar de cable.' },
      { name: 'Pájaros Inversos (Reverse Fly)',   sets: '3', reps: '15',    rest: 45,  videoId: 'HSoHeSjvIdY', muscle: 'Deltoides posterior', tip: 'Torso inclinado a 45°. Codos ligeramente doblados. Fija los codos y mueve solo el hombro.' },
      { name: 'Press Francés con Barra EZ',       sets: '3', reps: '10–12', rest: 60,  videoId: 'vB5OHsJ3EMc', muscle: 'Tríceps',            tip: 'Codos apuntan al techo todo el tiempo. Baja hasta la frente. No los abras hacia los lados.' },
    ],
    home: [
      { name: 'Flexiones Explosivas (Clapping)',    sets: '4', reps: '8',       rest: 90, videoId: 'IODxDxX7oi4', muscle: 'Pecho / Potencia',  tip: 'Explosión máxima al subir. Si no podés palmear: flexiones normales lo más rápido posible.' },
      { name: 'Flexiones Diamante',                 sets: '4', reps: '10–15',   rest: 75, videoId: 'IODxDxX7oi4', muscle: 'Tríceps / Pecho',   tip: 'Manos formando diamante bajo el pecho. Activa el pecho interno y el tríceps con más énfasis.' },
      { name: 'Flexiones Declinadas (pies en silla)', sets: '3', reps: '12',    rest: 60, videoId: 'IODxDxX7oi4', muscle: 'Pecho superior',    tip: 'Pies elevados en silla. El ángulo activa el pecho superior igual que el press inclinado.' },
      { name: 'Pike Push-ups Lentos (3-1-3)',       sets: '3', reps: '10',      rest: 75, videoId: 'sposDXWEB0A', muscle: 'Hombros',            tip: 'Baja en 3 seg, pausa 1 seg abajo, sube en 3 seg. El tempo convierte un ejercicio fácil en difícil.' },
      { name: 'Dips en Silla al Fallo',             sets: '3', reps: 'al fallo', rest: 75, videoId: 'l4kQd9eWclE', muscle: 'Tríceps',           tip: 'Cuerpo vertical. Al fallo real y controlado. Para progresar: eleva los pies en otra silla.' },
    ],
  },

  // ── VIE — PULL B ─────────────────────────────────────────
  {
    day: 'VIE', label: 'PULL B', focus: 'Espalda · Bíceps (variantes)', rest: false,
    gym: [
      { name: 'Dominadas al Fallo',               sets: '4', reps: 'al fallo', rest: 180, videoId: 'eGo4IYlbE5g', muscle: 'Dorsal',        tip: 'Segunda sesión semanal. Si mejorás aunque sea 1 rep respecto al lunes, la semana fue exitosa.' },
      { name: 'Remo con Mancuerna',               sets: '4', reps: '10–12 × lado', rest: 75, videoId: 'roCP6wCXPqo', muscle: 'Espalda media', tip: 'Codo al techo. Contrae la espalda en el tope 1 seg. Sin rotar el torso al jalar.' },
      { name: 'Pullover en Cable',                sets: '3', reps: '12–15',    rest: 60,  videoId: 'FK4jEXqJHZA', muscle: 'Dorsal',        tip: 'Polea alta, brazos casi rectos. Jala hacia abajo activando el dorsal. Tensión constante todo el rango.' },
      { name: 'Curl Inclinado con Mancuernas',    sets: '3', reps: '10–12',    rest: 75,  videoId: 'av7-8igSXTs', muscle: 'Bíceps',        tip: 'Banco a 45°. Los brazos cuelgan por detrás del cuerpo. Máximo estiramiento del bíceps al inicio.' },
      { name: 'Curl Concentrado',                 sets: '3', reps: '12 × lado', rest: 45,  videoId: 'BZFgeQfOCGE', muscle: 'Bíceps',        tip: 'Codo apoyado en la rodilla. Aislamiento total. Contrae 1 seg arriba. Sin compensar con el torso.' },
    ],
    home: [
      { name: 'Dominadas con Pausa 1 seg',        sets: '4', reps: 'máx con pausa', rest: 120, videoId: 'eGo4IYlbE5g', muscle: 'Dorsal',        tip: 'La pausa de 1 seg arriba multiplica el estímulo aunque hagas menos reps totales.' },
      { name: 'Remo con Mochila Bilateral',        sets: '4', reps: '12',            rest: 75,  videoId: 'roCP6wCXPqo', muscle: 'Espalda media',  tip: 'Mochila pesada. Torso a 45°. Jala al abdomen bajo. Sin inercia del torso.' },
      { name: 'Superman Isométrico',              sets: '3', reps: '30 seg',         rest: 45,  videoId: 'z6PJMT2y8GQ', muscle: 'Espalda baja',   tip: 'Sube y mantén la posición. Activa la cadena posterior completa de manera isométrica.' },
      { name: 'Curl con Mochila 21s',             sets: '3', reps: '21 (7+7+7)',     rest: 90,  videoId: 'av7-8igSXTs', muscle: 'Bíceps',         tip: '7 reps mitad inferior + 7 mitad superior + 7 rango completo. Sin descanso entre las 3 fases.' },
      { name: 'Curl Inverso con Botella',         sets: '3', reps: '15–20',          rest: 45,  videoId: 'TwD-YGVP4Bk', muscle: 'Antebrazo',      tip: 'Agarre invertido. Trabaja el braquiorradial. Codos completamente fijos al cuerpo.' },
    ],
  },

  // ── SÁB — LEGS B + CORE ──────────────────────────────────
  {
    day: 'SÁB', label: 'LEGS B + CORE', focus: 'Isquiotibiales · Glúteos · Core', rest: false,
    gym: [
      { name: 'Peso Muerto Rumano (RDL)',          sets: '4', reps: '10–12', rest: 90, videoId: 'op9kVnSso6Q', muscle: 'Isquiotibiales', tip: 'Bisagra de cadera pura. Baja hasta sentir el jalón en los isquios. Rodillas ligeramente dobladas y fijas.' },
      { name: 'Curl de Isquiotibiales Máquina',    sets: '4', reps: '10–12', rest: 75, videoId: 'Orxowest56U', muscle: 'Isquiotibiales', tip: 'Baja en 3 seg. El músculo crece más bajando lento. Extensión completa entre cada repetición.' },
      { name: 'Sentadilla Búlgara c/ Mancuernas',  sets: '3', reps: '10 × pierna', rest: 90, videoId: 'QOVaHwm-Q6U', muscle: 'Glúteos',     tip: 'Pie trasero en banco. Inclina levemente el torso para énfasis en glúteo. Control total en la bajada.' },
      { name: 'Rueda Abdominal (Ab Wheel)',         sets: '4', reps: '8–12',  rest: 60, videoId: 'AhGCpbPf77U', muscle: 'Core',           tip: 'Desde rodillas. Extiende sin arquear la espalda baja. Vuelve contrayendo el abdomen, no jalando con los brazos.' },
      { name: 'Plancha RKC',                       sets: '3', reps: '45 seg', rest: 45, videoId: 'ASdvN_XEl_c', muscle: 'Core',           tip: 'Aprieta glúteos + abdomen + cuádriceps al máximo simultáneamente. Es radicalmente más difícil que la plancha normal.' },
    ],
    home: [
      { name: 'Nordic Curl (pies bajo sofá)',       sets: '4', reps: '6–8',          rest: 120, videoId: '0Njz2FBOJIE', muscle: 'Isquiotibiales', tip: 'El ejercicio #1 de isquios sin máquina. Baja LENTO (5–10 seg). Usa las manos para subir.' },
      { name: 'Hip Thrust Elevado Pausa 3s',        sets: '4', reps: '15',           rest: 75,  videoId: 'SEdqd1n0cvg', muscle: 'Glúteos',         tip: 'Hombros en el sofá. Pausa 3 seg arriba. Sin pausa es solo movimiento; con pausa es trabajo real.' },
      { name: 'Sentadilla Búlgara',                 sets: '3', reps: '10 × pierna',  rest: 75,  videoId: 'QOVaHwm-Q6U', muscle: 'Glúteos',         tip: 'Pie trasero en silla. Bajada en 3 seg. Si es fácil, usa mochila como contrapeso.' },
      { name: 'Dead Bug',                           sets: '3', reps: '10 × lado',    rest: 60,  videoId: 'g_BYB0R-4Ws', muscle: 'Core',            tip: 'Espalda PEGADA al suelo en todo momento. Si se arquea, reduce el rango de movimiento.' },
      { name: 'Plancha RKC',                        sets: '3', reps: '40 seg',       rest: 45,  videoId: 'ASdvN_XEl_c', muscle: 'Core',            tip: 'Aprieta glúteos + abdomen + cuádriceps al máximo. 40 seg de esto equivale a 2 min de plancha normal.' },
    ],
  },

  // ── DOM — REST ───────────────────────────────────────────
  {
    day: 'DOM', label: 'DESCANSO', focus: 'Recuperación activa', rest: true,
    gym: [], home: [],
  },
];

const REST_ACTIVITIES = [
  '🔄 Rotaciones articulares completas · 5 min',
  '🦵 Estiramiento isquios y cuádriceps · 45 seg × lado',
  '🌊 Cobra + Child\'s Pose · 60 seg cada uno',
  '🚶 Caminata suave 20–30 min (sin apuro)',
  '💧 Hidratación alta · mínimo 3L de agua',
  '😴 Priorizá 8 horas de sueño esta noche',
];

const CIRCUMFERENCE = 175.9;

export default function WorkoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const todayIdx = (new Date().getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [dayMode, setDayMode] = useState<'gym' | 'home' | null>(null);
  const [showModeModal, setShowModeModal] = useState(todayIdx !== 6);
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
    if (!PLAN[selectedDay].rest) setShowModeModal(true);
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
      const dayPlan = PLAN[selectedDay];
      const sRes = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_key: dayPlan.day, split_type: dayPlan.label, mode: dayMode === 'gym' ? 'gym' : 'casa', session_date: dateStr }),
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

  const dayPlan = PLAN[selectedDay];
  const exercises: Ex[] = dayMode === 'gym' ? dayPlan.gym : dayMode === 'home' ? dayPlan.home : [];
  const accent = dayMode === 'home' ? '#ff6b35' : '#e8ff47';
  const doneCount = exercises.filter((_, i) => completed[i]).length;
  const pct = exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0;
  const offset = CIRCUMFERENCE * (1 - timerRemaining / timerTotal);
  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading || !user) {
    return <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center"><div className="spinner" /></div>;
  }

  return (
    <div className="page-root">

      {/* ── Header ── */}
      <div style={{ padding: '24px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="font-bebas" style={{ fontSize: 30, letterSpacing: 3, color: '#e8ff47' }}>
            {dayPlan.label}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{dayPlan.focus}</div>
        </div>
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#666', textTransform: 'uppercase' }}>
          {['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'][selectedDay]}
        </div>
      </div>

      {/* ── Day strip ── */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {PLAN.map((d, i) => {
          const isSelected = i === selectedDay;
          const isToday = i === todayIdx;
          return (
            <button key={i} onClick={() => setSelectedDay(i)} style={{
              flexShrink: 0, minWidth: 56,
              background: isSelected ? 'rgba(232,255,71,0.08)' : '#111',
              border: `1.5px solid ${isSelected ? '#e8ff47' : isToday ? 'rgba(255,255,255,0.2)' : '#2a2a2a'}`,
              borderRadius: 12, padding: '10px 8px', textAlign: 'center', cursor: 'pointer',
              opacity: d.rest ? 0.5 : 1,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isSelected ? '#e8ff47' : '#666' }}>{d.day}</div>
              <div style={{ fontSize: 16, marginTop: 4 }}>{d.rest ? '😴' : '🏋️'}</div>
            </button>
          );
        })}
      </div>

      {/* ── Gym / Casa modal ── */}
      {showModeModal && !dayPlan.rest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#666', marginBottom: 8 }}>
            SESIÓN — {dayPlan.day}
          </div>
          <div className="font-bebas" style={{ fontSize: 34, letterSpacing: 2, marginBottom: 4, textAlign: 'center', color: '#f2f0ea' }}>
            {dayPlan.label}
          </div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 32, textAlign: 'center' }}>
            {dayPlan.focus}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
            <button onClick={() => { setDayMode('gym'); setShowModeModal(false); }} style={{
              background: '#e8ff47', color: '#000', border: 'none', borderRadius: 14, padding: '20px',
              fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 20, letterSpacing: 3, cursor: 'pointer',
            }}>
              🏛️ SÍ, VOY AL GYM
            </button>
            <button onClick={() => { setDayMode('home'); setShowModeModal(false); }} style={{
              background: '#1a1a1a', color: '#ff6b35', border: '1.5px solid #ff6b35', borderRadius: 14, padding: '20px',
              fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 20, letterSpacing: 3, cursor: 'pointer',
            }}>
              🏠 NO, ME QUEDO EN CASA
            </button>
            <button onClick={() => setShowModeModal(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Rest day ── */}
      {dayPlan.rest && (
        <div style={{ margin: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>🧘</div>
          <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 2, marginTop: 16, color: '#3ddc84' }}>DESCANSO ACTIVO</div>
          <div style={{ color: '#666', fontSize: 13, marginTop: 8, lineHeight: 1.7, marginBottom: 24 }}>
            El músculo crece y la grasa se metaboliza durante el descanso.<br />No lo saltés — es parte del plan.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REST_ACTIVITIES.map(item => (
              <div key={item} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '11px 14px', textAlign: 'left', fontSize: 13 }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── No mode selected ── */}
      {!dayPlan.rest && !dayMode && (
        <div style={{ margin: '40px 20px', textAlign: 'center' }}>
          <div style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>Elegí tu modo para ver la rutina de hoy.</div>
          <button onClick={() => setShowModeModal(true)} style={{ background: '#e8ff47', color: '#000', border: 'none', borderRadius: 10, padding: '14px 28px', fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 16, letterSpacing: 2, cursor: 'pointer' }}>
            ELEGIR MODO
          </button>
        </div>
      )}

      {/* ── Session ── */}
      {!dayPlan.rest && dayMode && (
        <>
          {/* Mode badge + change */}
          <div style={{ margin: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 13, letterSpacing: 2,
              padding: '6px 14px', borderRadius: 6, border: `1.5px solid ${accent}`, color: accent,
              background: dayMode === 'gym' ? 'rgba(232,255,71,0.06)' : 'rgba(255,107,53,0.06)',
            }}>
              {dayMode === 'gym' ? '🏛️ GYM' : '🔥 CASA'}
            </div>
            <button onClick={() => setShowModeModal(true)} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>
              Cambiar
            </button>
          </div>

          {/* Timer */}
          <div style={{ margin: '16px 20px 0', background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                color: timerTotal === s ? '#e8ff47' : '#888',
                borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>
                {s < 120 ? `${s}s` : `${s / 60}min`}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div style={{ margin: '18px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="section-label">PROGRESO SESIÓN</div>
              <div className="font-bebas" style={{ fontSize: 22, color: '#e8ff47' }}>{pct}%</div>
            </div>
            <div style={{ background: '#111', borderRadius: 4, height: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#e8ff47', width: `${pct}%`, borderRadius: 4, transition: 'width 0.4s', boxShadow: '0 0 8px rgba(232,255,71,0.4)' }} />
            </div>
          </div>

          {/* Exercises */}
          <div style={{ margin: '20px 20px 0' }}>
            <div className="section-label" style={{ marginBottom: 12 }}>
              {exercises.length} EJERCICIOS · {dayPlan.focus.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exercises.map((ex, i) => {
                const done = !!completed[i];
                const isExpanded = !!expanded[i];
                return (
                  <div key={i} onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))} style={{
                    background: '#181818', border: `1.5px solid ${done ? '#2a2a2a' : '#333'}`, borderRadius: 14, padding: 16,
                    cursor: 'pointer', opacity: done ? 0.5 : 1, position: 'relative', overflow: 'hidden', transition: 'opacity 0.2s',
                  }}>
                    {/* Accent bar */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: done ? '#333' : accent }} />

                    <div style={{ paddingLeft: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, paddingRight: 12 }}>
                        {/* Muscle tag */}
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 4 }}>
                          {ex.muscle}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#f2f0ea', marginBottom: 8 }}>{ex.name}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#888', borderRadius: 6, padding: '3px 8px' }}>
                            {ex.sets} series
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: `${accent}20`, color: accent, borderRadius: 6, padding: '3px 8px' }}>
                            {ex.reps} reps
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.04)', color: '#666', borderRadius: 6, padding: '3px 8px' }}>
                            ⏱ {ex.rest < 60 ? `${ex.rest}s` : `${ex.rest / 60}min`} descanso
                          </span>
                        </div>
                      </div>
                      {/* Check button */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleExercise(i); }}
                        style={{
                          width: 34, height: 34, borderRadius: '50%',
                          border: `2px solid ${done ? '#3ddc84' : '#333'}`,
                          background: done ? '#3ddc84' : 'transparent',
                          color: done ? '#000' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 800, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                        }}
                      >✓</button>
                    </div>

                    {/* Expanded tip + video */}
                    {isExpanded && (
                      <div style={{ paddingLeft: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a2a' }}>
                        <div style={{ background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.12)', borderRadius: 9, padding: '10px 12px', marginBottom: 10 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#e8ff47', marginBottom: 5 }}>
                            💡 TÉCNICA
                          </div>
                          <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>{ex.tip}</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setVideoId(ex.videoId); setVideoTitle(ex.name); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: '1.5px solid #2a2a2a', color: '#666', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          ▶ Ver técnica en YouTube
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete session */}
          <div style={{ padding: '24px 20px 0' }}>
            <button className="btn-primary" onClick={completeSession} disabled={pct < 100 || saving || sessionDone}
              style={{ background: sessionDone ? '#2a2a2a' : undefined, color: sessionDone ? '#666' : undefined }}>
              {saving ? 'GUARDANDO...' : sessionDone ? '✓ SESIÓN COMPLETADA' : `COMPLETAR SESIÓN (${pct}%)`}
            </button>
          </div>
        </>
      )}

      {/* ── Rest overlay ── */}
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

      {/* ── Video modal ── */}
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

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#e8ff47', color: '#0a0a0a', padding: '12px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13, zIndex: 300, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
