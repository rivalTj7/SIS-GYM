'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

type Ex = { name: string; sets: number; reps: string; videoId: string; tip: string };
type FinisherDef = { title: string; sub: string; moves: string[] };
type DayPlan = { label: string; muscle: string; splitType: string; gym: Ex[]; home: Ex[]; finisher: FinisherDef | null; isCardio?: boolean };

const PLAN: DayPlan[] = [
  {
    label: 'PUSH 1', muscle: 'PECHO · HOMBROS · TRÍCEPS', splitType: 'push1',
    gym: [
      { name: 'Press de Banca c/ Barra', sets: 4, reps: '8–10', videoId: 'rT7DgCr-3pg', tip: 'Escápulas retraídas, agarre ancho. Baja lento 3 seg hasta rozar el pecho. RIR 2.' },
      { name: 'Press Inclinado c/ Mancuernas', sets: 3, reps: '10–12', videoId: 'QsYre2tPIgA', tip: 'Banco a 30-45°. Baja hasta rozar el pecho, sube explosivo. RIR 2.' },
      { name: 'Press de Hombros (Máquina)', sets: 3, reps: '12–15', videoId: 'qEwKCR5JCog', tip: 'Espalda pegada. No bloquees codos arriba. Contrae el deltoides.' },
      { name: 'Elevaciones Laterales', sets: 3, reps: '15', videoId: 'kDqklk1ZESo', tip: 'Codos ligeramente flexionados. Lleva los pesos al nivel de hombros. Pausa 1 seg.' },
      { name: 'Tríceps en Polea (Cuerda)', sets: 3, reps: '12–15', videoId: 'vB5OHsJ3EME', tip: 'Codos fijos al costado. Separa la cuerda al final. Contrae fuerte.' },
    ],
    home: [
      { name: 'Push-ups (máximo control)', sets: 4, reps: '15–20', videoId: 'IODxDxX7oi4', tip: 'Cuerpo recto, pecho roza el suelo. Si falla la forma, rodillas en tierra.' },
      { name: 'Pike Push-ups', sets: 3, reps: '12', videoId: 'IODxDxX7oi4', tip: 'Cadera en V. Baja la cabeza entre las manos. Trabaja hombros.' },
      { name: 'Tríceps en Banco / Silla', sets: 3, reps: '15', videoId: 'zl6EHT99Cjc', tip: 'Silla estable detrás. Talones adelante, baja hasta 90°. Empuja con tríceps.' },
      { name: 'Diamond Push-ups', sets: 3, reps: '10–12', videoId: 'IODxDxX7oi4', tip: 'Pulgares e índices forman un diamante. Trabaja tríceps y pecho interno.' },
      { name: 'Shoulder Taps en Plancha', sets: 3, reps: '20 total', videoId: 'nmwgirgXLYM', tip: 'Plancha alta. Toca el hombro contrario sin rotar las caderas. Core activo.' },
    ],
    finisher: { title: '🔥 QUEMADOR FINAL', sub: '3 rondas — sin descanso entre ejercicios · 45 seg pausa entre rondas', moves: ['Push-ups × 15', 'Jumping Jacks × 30', 'Plancha 30 seg'] },
  },
  {
    label: 'PULL 1', muscle: 'ESPALDA · BÍCEPS · ANTEBRAZO', splitType: 'pull1',
    gym: [
      { name: 'Jalón al Pecho (Polea Ancha)', sets: 4, reps: '10–12', videoId: 'CAwf7n6Luuc', tip: 'Inclina 15° atrás, baja la barra al pecho. Junta escápulas al final. RIR 2.' },
      { name: 'Remo en Máquina (Sentado)', sets: 4, reps: '10–12', videoId: 'GZbfZ033f74', tip: 'Pecho contra el soporte. Lleva codos bien atrás, aprieta escápulas.' },
      { name: 'Pull-over c/ Mancuerna', sets: 3, reps: '12', videoId: 'yyBk_1_9hcE', tip: 'Codos ligeramente doblados. Baja hasta sentir estiramiento en el dorsal.' },
      { name: 'Curl de Bíceps c/ Barra', sets: 3, reps: '10–12', videoId: 'ykJmrZ5v0Oo', tip: 'Codos fijos. No balancees el torso. Aprieta en el pico del movimiento.' },
      { name: 'Curl de Martillo', sets: 3, reps: '12', videoId: 'TwD-YGVP4Bk', tip: 'Pulgares arriba. Trabaja el braquial y antebrazo. Alterna brazos.' },
    ],
    home: [
      { name: 'Remo Invertido (debajo de mesa)', sets: 4, reps: '10–12', videoId: 'CAwf7n6Luuc', tip: 'Cuerpo recto, pecho al borde. Lleva el pecho hacia arriba. Escápulas adentro.' },
      { name: 'Superman con Hold 3 seg', sets: 3, reps: '12', videoId: 'ASdvN_XEl_c', tip: 'Boca abajo. Levanta brazos y piernas simultáneamente. Aprieta glúteos.' },
      { name: 'Curl c/ Mochila (alternado)', sets: 3, reps: '15', videoId: 'ykJmrZ5v0Oo', tip: 'Carga la mochila con libros. Codos fijos. Alterna brazos para más tensión.' },
      { name: 'Dominada Australiana', sets: 3, reps: 'Máx reps', videoId: 'CAwf7n6Luuc', tip: 'Barra baja o borde de mesa sólida. Cuerpo recto, jala escápulas.' },
      { name: 'Curl Reverso (pronación)', sets: 3, reps: '15', videoId: 'ykJmrZ5v0Oo', tip: 'Palmas hacia abajo. Trabaja antebrazo y braquial. Usa peso más ligero.' },
    ],
    finisher: { title: '🔥 QUEMADOR FINAL', sub: '3 rondas — sin descanso entre ejercicios · 45 seg pausa entre rondas', moves: ['Mountain Climbers 30 seg', 'High Knees 30 seg', 'Saltos de Tijera × 20'] },
  },
  {
    label: 'PIERNAS 1', muscle: 'CUÁDRICEPS · GLÚTEOS · PANTORRILLAS', splitType: 'legs1',
    gym: [
      { name: 'Sentadilla en Máquina (Hack Squat)', sets: 4, reps: '10–12', videoId: 'GvRgijoJ2xY', tip: 'Pies al ancho de hombros. Baja hasta 90°+. Rodillas siguen los pies. RIR 2.' },
      { name: 'Prensa de Piernas', sets: 4, reps: '12–15', videoId: 'GvRgijoJ2xY', tip: 'Pies en la mitad de la plataforma. Baja hasta 90°. No bloquees rodillas.' },
      { name: 'Extensión Cuádriceps (Máquina)', sets: 3, reps: '15', videoId: '4ZDm5EbiFI8', tip: 'Contrae en el tope, baja controlado 3 seg. Trabaja el vasto interno.' },
      { name: 'Hip Thrust c/ Barra', sets: 4, reps: '12', videoId: 'xDmFkJxPzeM', tip: 'Espalda alta sobre el banco. Empuja con talones, contrae glúteo arriba. RIR 2.' },
      { name: 'Pantorrillas en Máquina (de pie)', sets: 4, reps: '20', videoId: 'gwLzBJYoWlI', tip: 'Talón completo abajo en el rango. Sube lo máximo posible. Pausa 1 seg arriba.' },
    ],
    home: [
      { name: 'Sentadilla c/ Peso Corporal', sets: 4, reps: '20–25', videoId: 'u9e45mvKXbg', tip: 'Pies levemente abiertos. Baja hasta muslos paralelos. Talones en el suelo.' },
      { name: 'Zancadas Estáticas', sets: 4, reps: '12 c/pierna', videoId: 'QOVaHwm-Q6U', tip: 'Rodilla trasera casi toca el suelo. Torso erguido. Empuja con talón delante.' },
      { name: 'Glute Bridge (con pausa)', sets: 4, reps: '20', videoId: 'OUgsJ8-Vi0E', tip: 'Pies planos, rodillas a 90°. Eleva las caderas y aprieta glúteos arriba 2 seg.' },
      { name: 'Step-ups (silla resistente)', sets: 3, reps: '15 c/pierna', videoId: 'QOVaHwm-Q6U', tip: 'Sube con una pierna y siente el glúteo trabajar. Controla la bajada.' },
      { name: 'Pantorrillas de Pie (escalón)', sets: 4, reps: '25–30', videoId: 'gwLzBJYoWlI', tip: 'Usa el borde de un escalón para máximo rango. Baja talón completamente.' },
    ],
    finisher: { title: '🔥 QUEMADOR FINAL', sub: '3 rondas — el que más calorías quema de la semana', moves: ['Sentadilla Salto × 15', 'Zancadas Caminando × 20 pasos', 'Saltos de Tijera × 30'] },
  },
  {
    label: 'PUSH 2', muscle: 'PECHO · HOMBROS · TRÍCEPS (B)', splitType: 'push2',
    gym: [
      { name: 'Press Inclinado c/ Barra', sets: 4, reps: '8–10', videoId: 'Y-MBP9BKOL0', tip: 'Banco a 30°. Trabaja clavicular del pecho. Baja al cuello, no al esternón.' },
      { name: 'Aperturas c/ Mancuernas (plano)', sets: 3, reps: '12–15', videoId: 'eozdVDA78K0', tip: 'Codos ligeramente doblados. Siente el estiramiento del pecho. Abrazo abierto.' },
      { name: 'Arnold Press', sets: 3, reps: '10–12', videoId: 'qEwKCR5JCog', tip: 'Empieza con palmas hacia vos, rota mientras subes. Mayor rango de movimiento.' },
      { name: 'Elevaciones Frontales (alternas)', sets: 3, reps: '12', videoId: '4EAMqhbXFDQ', tip: 'Brazo recto o levemente doblado. Lleva hasta el nivel de los hombros.' },
      { name: 'Fondos de Tríceps en Paralelas', sets: 3, reps: '12–15', videoId: 'zl6EHT99Cjc', tip: 'Torso erguido para aislar tríceps. Codos atrás. Baja hasta 90°.' },
    ],
    home: [
      { name: 'Push-ups Inclinados (pies arriba)', sets: 4, reps: '10–12', videoId: 'IODxDxX7oi4', tip: 'Pies en silla. Mayor énfasis en pecho superior y hombros.' },
      { name: 'Archer Push-ups', sets: 3, reps: '8 c/lado', videoId: 'IODxDxX7oi4', tip: 'Un brazo extendido, otro dobla. Más difícil, mayor carga en el pecho.' },
      { name: 'Overhead Press c/ Mochila', sets: 3, reps: '12–15', videoId: 'qEwKCR5JCog', tip: 'Mochila cargada como peso. Empuja directo hacia arriba, no adelante.' },
      { name: 'Fondos en Silla (tríceps)', sets: 3, reps: '15', videoId: 'zl6EHT99Cjc', tip: 'Silla estable. Talones adelante, baja hasta 90°. Empuja con tríceps.' },
      { name: 'Burpee Push-up', sets: 3, reps: '10', videoId: 'dZgVxmf6jkA', tip: 'Burpee normal pero agrega una flexión en el fondo. Intensidad máxima.' },
    ],
    finisher: { title: '🔥 TABATA BRUTAL', sub: '4 minutos — 20 seg de Burpees / 10 seg descanso × 8 rondas', moves: ['Burpees × 20 seg (máximo esfuerzo)', '10 seg descanso', 'Repetir 8 rondas — total 4 minutos'] },
  },
  {
    label: 'PULL 2', muscle: 'ESPALDA · BÍCEPS (B)', splitType: 'pull2',
    gym: [
      { name: 'Jalón Agarre Cerrado (supino)', sets: 4, reps: '8–12', videoId: 'CAwf7n6Luuc', tip: 'Agarre neutral o supino. Mayor énfasis en bíceps y dorsal inferior.' },
      { name: 'Remo c/ Barra', sets: 4, reps: '10–12', videoId: 'j3Igk5nyZE4', tip: 'Espalda plana, ligera inclinación. Lleva la barra al abdomen. No redondees.' },
      { name: 'Face Pulls c/ Cuerda', sets: 3, reps: '15', videoId: 'rep-qVOkqgk', tip: 'Altura de ojos. Lleva la cuerda a la frente separando los extremos. Deltoides posterior.' },
      { name: 'Curl Concentrado c/ Mancuerna', sets: 3, reps: '12', videoId: '0AUGkch3tzc', tip: 'Codo en muslo interno. No balancees. Contrae bíceps en el pico.' },
      { name: 'Encogimiento de Hombros (Trapecio)', sets: 3, reps: '15', videoId: 'cJRVVxmytaM', tip: 'Sube directamente arriba, sin rotación. Mantén 1 seg en el tope.' },
    ],
    home: [
      { name: 'Remo Invertido (agarre supino)', sets: 4, reps: '12', videoId: 'CAwf7n6Luuc', tip: 'Palmas hacia arriba para mayor activación de bíceps. Junta escápulas arriba.' },
      { name: 'Good Morning c/ Mochila', sets: 3, reps: '15', videoId: 'YA-h3n9L4YU', tip: 'Cadera bisagra, espalda recta. Siente los isquiotibiales y espalda baja.' },
      { name: 'Face Pull c/ Banda Elástica', sets: 3, reps: '20', videoId: 'rep-qVOkqgk', tip: 'Ancla la banda a la altura de ojos. Tira hacia la cara separando los extremos.' },
      { name: 'Curl Bíceps c/ Mochila (alternado)', sets: 3, reps: '15', videoId: 'ykJmrZ5v0Oo', tip: 'Ajusta peso de la mochila. Alterna brazos para más tiempo bajo tensión.' },
      { name: 'Superman Alterno (Bird Dog)', sets: 3, reps: '12', videoId: 'ASdvN_XEl_c', tip: 'Levanta brazo opuesto a la pierna. Mejor coordinación y espalda baja.' },
    ],
    finisher: { title: '🔥 QUEMADOR FINAL', sub: '3 rondas — sin descanso entre ejercicios · 45 seg pausa entre rondas', moves: ['Jumping Jacks × 30', 'Mountain Climbers 30 seg', 'High Knees 30 seg'] },
  },
  {
    label: 'PIERNAS 2 + CORE', muscle: 'ISQUIOS · CORE · GLÚTEOS', splitType: 'legs2',
    gym: [
      { name: 'Peso Muerto Rumano c/ Barra', sets: 4, reps: '10–12', videoId: 'JCXUYuzwNrM', tip: 'Bisagra de cadera, espalda recta. Baja hasta sentir isquios estirados, no el suelo.' },
      { name: 'Curl Femoral (Máquina tumbado)', sets: 4, reps: '12–15', videoId: 'Orxowest56U', tip: 'Punta de pies un poco hacia afuera. Contrae y baja controlado 3 seg.' },
      { name: 'Sentadilla Búlgara', sets: 3, reps: '10 c/pierna', videoId: '2C-uNgKwPLE', tip: 'Pie trasero en banco. Baja directo abajo, no adelante. Peso en el talón delante.' },
      { name: 'Abductores (Máquina)', sets: 3, reps: '15', videoId: 'CuFKLALyaAc', tip: 'Contrae glúteo medio en el punto máximo. Baja lento y controlado.' },
      { name: 'Plancha + Russian Twists', sets: 3, reps: '60s + 20 reps', videoId: 'ASdvN_XEl_c', tip: 'Plancha estática 60 seg, luego 20 Russian Twists con disco. Core completo.' },
    ],
    home: [
      { name: 'Peso Muerto Rumano c/ Mochila', sets: 4, reps: '12', videoId: 'JCXUYuzwNrM', tip: 'Mochila cargada con libros. Bisagra de cadera, espalda recta.' },
      { name: 'Curl Femoral en Suelo', sets: 3, reps: '12', videoId: 'Orxowest56U', tip: 'Tumbado boca abajo. Dobla la rodilla contra resistencia (banda o toalla anclada).' },
      { name: 'Sentadilla Búlgara (silla)', sets: 3, reps: '10 c/pierna', videoId: '2C-uNgKwPLE', tip: 'Pie trasero en silla firme. Controla la bajada. El peso en el talón delante.' },
      { name: 'Glute Bridge Una Pierna', sets: 3, reps: '12 c/pierna', videoId: 'OUgsJ8-Vi0E', tip: 'Una pierna extendida, la otra empuja. Mayor activación por glúteo.' },
      { name: 'Plancha + Crunch Bicicleta', sets: 3, reps: '60s + 20 reps', videoId: 'ASdvN_XEl_c', tip: 'Plancha 60 seg, luego 20 crunches de bicicleta. Oblicuos + core profundo.' },
    ],
    finisher: { title: '🔥 QUEMADOR FINAL', sub: '3 rondas — el más duro de la semana, el que más quema', moves: ['Sentadilla Salto × 15', 'Burpees × 10', 'Mountain Climbers 30 seg'] },
  },
  {
    label: 'ZONA 2', muscle: 'CARDIO · QUEMA DE GRASA', splitType: 'cardio',
    gym: [], home: [], finisher: null, isCardio: true,
  },
];

const DAY_NAMES = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const CIRCUMFERENCE = 175.9;
const ZONE2_SECS = 40 * 60;

type DayState = { completed: Record<number, boolean>; weights: Record<number, string>; rirs: Record<number, number>; finisherDone: boolean };
const EMPTY_STATE: DayState = { completed: {}, weights: {}, rirs: {}, finisherDone: false };

export default function WorkoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const todayIdx = (new Date().getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [dayMode, setDayMode] = useState<'gym' | 'home' | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [ds, setDs] = useState<DayState>(EMPTY_STATE);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const [timerTotal, setTimerTotal] = useState(90);
  const [timerRemaining, setTimerRemaining] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [restActive, setRestActive] = useState(false);
  const [restRemaining, setRestRemaining] = useState(90);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cardioTimer, setCardioTimer] = useState(ZONE2_SECS);
  const [cardioRunning, setCardioRunning] = useState(false);
  const cardioRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [videoId, setVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [toast, setToast] = useState('');
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  const plan = PLAN[selectedDay];

  useEffect(() => {
    setDayMode(null);
    setExpanded({});
    setSessionDone(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerRemaining(timerTotal);
    if (cardioRef.current) clearInterval(cardioRef.current);
    setCardioRunning(false);
    setCardioTimer(ZONE2_SECS);
    loadDay(selectedDay);
    if (!PLAN[selectedDay].isCardio) setShowModeModal(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restRef.current) clearInterval(restRef.current);
      if (cardioRef.current) clearInterval(cardioRef.current);
    };
  }, []);

  function getStorageKey(day: number) {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((+d - +jan1) / 86400000) + jan1.getDay() + 1) / 7);
    return `burngt_v2_${d.getFullYear()}_w${week}_d${day}`;
  }

  function loadDay(day: number) {
    try {
      const raw = localStorage.getItem(getStorageKey(day));
      setDs(raw ? JSON.parse(raw) : EMPTY_STATE);
    } catch { setDs(EMPTY_STATE); }
  }

  function updateDs(updater: (prev: DayState) => DayState) {
    setDs(prev => {
      const next = updater(prev);
      try { localStorage.setItem(getStorageKey(selectedDay), JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function toggleExercise(idx: number) {
    let willDone = false;
    updateDs(prev => {
      willDone = !prev.completed[idx];
      return { ...prev, completed: { ...prev.completed, [idx]: willDone } };
    });
    setTimeout(() => { if (willDone) { showToast('¡Serie completada! 💪'); startRest(); } }, 0);
  }

  function toggleFinisher() {
    let willDone = false;
    updateDs(prev => { willDone = !prev.finisherDone; return { ...prev, finisherDone: willDone }; });
    setTimeout(() => { if (willDone) showToast('🔥 ¡Finisher completado! Eso quema la panza.'); }, 0);
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
          if (r <= 1) { if (timerRef.current) clearInterval(timerRef.current); setTimerRunning(false); try { navigator.vibrate?.([200, 100, 200]); } catch {} return 0; }
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
        if (r <= 1) { if (restRef.current) clearInterval(restRef.current); setRestActive(false); try { navigator.vibrate?.([300, 100, 300]); } catch {} return 0; }
        return r - 1;
      });
    }, 1000);
  }

  function skipRest() { if (restRef.current) clearInterval(restRef.current); setRestActive(false); }

  function toggleCardio() {
    if (cardioRunning) {
      if (cardioRef.current) clearInterval(cardioRef.current);
      setCardioRunning(false);
    } else {
      setCardioRunning(true);
      cardioRef.current = setInterval(() => {
        setCardioTimer(r => {
          if (r <= 1) { if (cardioRef.current) clearInterval(cardioRef.current); setCardioRunning(false); try { navigator.vibrate?.([500, 200, 500, 200, 500]); } catch {} showToast('🎉 ¡40 min de Zona 2 completados!'); return 0; }
          return r - 1;
        });
      }, 1000);
    }
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_key: DAY_NAMES[selectedDay], split_type: plan.splitType, mode: dayMode === 'gym' ? 'gym' : 'casa', session_date: dateStr }),
      });
      if (sRes.ok) {
        const { session } = await sRes.json();
        if (session?.id) {
          const exList = dayMode === 'gym' ? plan.gym : plan.home;
          const sets = exList.flatMap((ex, i) =>
            ds.completed[i] ? [{ session_id: session.id, exercise_name: ex.name, set_number: 1, reps: null, weight_kg: ds.weights[i] ? parseFloat(ds.weights[i]) : null, rir: ds.rirs[i] ?? null }] : []
          );
          if (sets.length > 0) await fetch('/api/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sets }) });
          await fetch(`/api/workouts/${session.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: true }) });
        }
      }
    } catch {}
    setSaving(false);
    setSessionDone(true);
    showToast('🏆 ¡SESIÓN COMPLETADA! Beast mode.');
  }

  const exercises = dayMode === 'gym' ? plan.gym : dayMode === 'home' ? plan.home : [];
  const accent = dayMode === 'home' ? '#ff6b35' : '#e8ff47';
  const doneCount = exercises.filter((_, i) => !!ds.completed[i]).length;
  const totalItems = exercises.length + (plan.finisher ? 1 : 0);
  const pct = totalItems > 0 ? Math.round(((doneCount + (ds.finisherDone ? 1 : 0)) / totalItems) * 100) : 0;
  const offset = CIRCUMFERENCE * (1 - timerRemaining / timerTotal);
  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading || !user) return <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="page-root">
      {/* Header */}
      <div style={{ padding: '24px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="font-bebas" style={{ fontSize: 28, letterSpacing: 3, color: '#e8ff47' }}>PLAN DE BATALLA</div>
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#666', textTransform: 'uppercase' }}>
          {['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'][selectedDay]}
        </div>
      </div>

      {/* Week strip */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {DAY_NAMES.map((name, i) => {
          const isSelected = i === selectedDay;
          const isToday = i === todayIdx;
          const p = PLAN[i];
          return (
            <button key={i} onClick={() => setSelectedDay(i)} style={{
              flexShrink: 0, minWidth: 50,
              background: isSelected ? 'rgba(232,255,71,0.08)' : '#111',
              border: `1.5px solid ${isSelected ? '#e8ff47' : isToday ? 'rgba(255,255,255,0.2)' : '#2a2a2a'}`,
              borderRadius: 12, padding: '8px 6px', textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isSelected ? '#e8ff47' : '#555' }}>{name}</div>
              <div style={{ fontSize: 15, marginTop: 3 }}>{p.isCardio ? '🚴' : '🏋️'}</div>
              <div style={{ fontSize: 7, color: '#333', marginTop: 2, fontWeight: 700 }}>{p.label}</div>
            </button>
          );
        })}
      </div>

      {/* Mode modal */}
      {showModeModal && !plan.isCardio && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>SESIÓN — {plan.label}</div>
          <div className="font-bebas" style={{ fontSize: 32, letterSpacing: 2, marginBottom: 4, textAlign: 'center', color: '#f2f0ea' }}>¿VAS AL GYM HOY?</div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 32, textAlign: 'center' }}>{plan.muscle}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
            <button onClick={() => { setDayMode('gym'); setShowModeModal(false); }} style={{ background: '#e8ff47', color: '#000', border: 'none', borderRadius: 14, padding: '20px', fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 20, letterSpacing: 3, cursor: 'pointer' }}>
              🏛️ SÍ, VOY AL GYM
            </button>
            <button onClick={() => { setDayMode('home'); setShowModeModal(false); }} style={{ background: '#1a1a1a', color: '#ff6b35', border: '1.5px solid #ff6b35', borderRadius: 14, padding: '20px', fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 20, letterSpacing: 3, cursor: 'pointer' }}>
              🏠 NO, ME QUEDO EN CASA
            </button>
            <button onClick={() => setShowModeModal(false)} style={{ background: 'none', border: 'none', color: '#444', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ZONE 2 CARDIO DAY */}
      {plan.isCardio ? (
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ background: 'rgba(61,220,132,0.06)', border: '1.5px solid rgba(61,220,132,0.2)', borderRadius: 20, padding: 24, marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(61,220,132,0.6)', marginBottom: 8 }}>DOMINGO — CARDIO ACTIVO</div>
            <div className="font-bebas" style={{ fontSize: 36, letterSpacing: 2, color: '#3ddc84', marginBottom: 8 }}>ZONA 2 CARDIO</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              A baja-moderada intensidad, el cuerpo usa la <span style={{ color: '#3ddc84', fontWeight: 700 }}>grasa como combustible principal</span>. Esto quema directamente lo que está en la panza y la cara.
            </div>
          </div>

          <div style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>FC OBJETIVO — ALEX</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="font-bebas" style={{ fontSize: 48, color: '#3ddc84', lineHeight: 1 }}>116–136</div>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 700, marginTop: 4 }}>PULSACIONES / MIN</div>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid #2a2a2a', paddingLeft: 16 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
                  60–70% FCmax<br />FCmax = 194 bpm<br />
                  <span style={{ color: '#3ddc84', fontWeight: 700 }}>Podés hablar pero te cuesta.</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>ELEGÍ TU ACTIVIDAD</div>
            {['🚶 Caminata rápida — 5.5–6.5 km/h', '🏃 Trote suave — hasta 8 km/h', '🚴 Bicicleta estática — resistencia moderada', '⛷️ Elíptica — ritmo constante', '🏊 Nado continuo tranquilo'].map(opt => (
              <div key={opt} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>{opt}</div>
            ))}
          </div>

          <div style={{ background: '#181818', border: `1.5px solid ${cardioRunning ? 'rgba(61,220,132,0.4)' : '#2a2a2a'}`, borderRadius: 16, padding: 24, textAlign: 'center', marginBottom: 12, transition: 'border-color 0.3s' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>TIMER — 40 MINUTOS</div>
            <div className="font-bebas" style={{ fontSize: 72, letterSpacing: 2, color: cardioTimer === 0 ? '#3ddc84' : '#e8ff47', lineHeight: 1 }}>
              {fmtTime(cardioTimer)}
            </div>
            {cardioTimer === 0 ? (
              <div style={{ fontSize: 18, color: '#3ddc84', fontWeight: 700, margin: '16px 0 8px' }}>¡COMPLETADO! 🔥 Quemaste ~250–350 kcal de grasa.</div>
            ) : (
              <button onClick={toggleCardio} style={{
                marginTop: 16, background: cardioRunning ? 'rgba(61,220,132,0.1)' : '#3ddc84',
                color: cardioRunning ? '#3ddc84' : '#000', border: '2px solid #3ddc84',
                borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-bebas, sans-serif)', letterSpacing: 2,
              }}>
                {cardioRunning ? '⏸ PAUSAR' : '▶ INICIAR ZONA 2'}
              </button>
            )}
            {cardioRunning && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#3ddc84', fontWeight: 700 }}>Mantené FC 116–136 bpm. Respiración controlada.</div>
            )}
          </div>

          <div style={{ background: 'rgba(61,220,132,0.04)', border: '1px solid rgba(61,220,132,0.1)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#3ddc84', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>¿Por qué Zona 2 quema la panza?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
              A intensidades altas (HIIT) el cuerpo usa glucógeno. A intensidades bajas (Zona 2) usa <strong style={{ color: 'rgba(255,255,255,0.6)' }}>grasa directamente como combustible</strong>. 40 min = 250–350 kcal de grasa. Sumado al déficit de la semana, esto es lo que mueve la balanza.
            </div>
          </div>
        </div>

      ) : !dayMode ? (
        <div style={{ margin: '40px 20px', textAlign: 'center' }}>
          <div className="font-bebas" style={{ fontSize: 32, letterSpacing: 2, color: '#f2f0ea', marginBottom: 6 }}>{plan.label}</div>
          <div style={{ color: '#555', fontSize: 12, fontWeight: 700, marginBottom: 24 }}>{plan.muscle}</div>
          <button onClick={() => setShowModeModal(true)} style={{ background: '#e8ff47', color: '#000', border: 'none', borderRadius: 10, padding: '14px 28px', fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 16, letterSpacing: 2, cursor: 'pointer' }}>
            ELEGIR MODO
          </button>
        </div>
      ) : (
        <>
          {/* Session badge */}
          <div style={{ margin: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 13, letterSpacing: 2, padding: '6px 14px', borderRadius: 6, border: `1.5px solid ${accent}`, color: accent, background: dayMode === 'gym' ? 'rgba(232,255,71,0.06)' : 'rgba(255,107,53,0.06)' }}>
              {dayMode === 'gym' ? '🏛️ GYM' : '🏠 CASA'} — {plan.label}
            </div>
            <button onClick={() => setShowModeModal(true)} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#444', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>Cambiar</button>
          </div>
          <div style={{ margin: '4px 20px 0', fontSize: 10, color: '#444', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{plan.muscle}</div>

          {/* Rest timer */}
          <div style={{ margin: '16px 20px 0', background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#555', marginBottom: 4 }}>DESCANSO ENTRE SERIES</div>
              <div className="font-bebas" style={{ fontSize: 44, letterSpacing: 2, lineHeight: 1, color: timerRemaining <= 10 && timerRunning ? '#ff6b35' : '#e8ff47' }}>
                {fmtTime(timerRemaining)}
              </div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
                {timerRunning ? 'Descansando...' : timerRemaining === 0 ? '¡A la siguiente serie!' : 'Presiona START'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <svg width="56" height="56" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" stroke="#2a2a2a" />
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" stroke={timerRemaining <= 10 && timerRunning ? '#ff6b35' : '#e8ff47'} strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
              </svg>
              <button onClick={toggleTimer} style={{ background: timerRunning ? '#ff6b35' : '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                {timerRunning ? 'STOP' : 'START'}
              </button>
            </div>
          </div>

          {/* Timer presets */}
          <div style={{ margin: '8px 20px 0', display: 'flex', gap: 6 }}>
            {[60, 90, 120, 180].map(s => (
              <button key={s} onClick={() => setPreset(s)} style={{
                flex: 1, background: timerTotal === s ? 'rgba(232,255,71,0.05)' : '#111',
                border: `1.5px solid ${timerTotal === s ? '#e8ff47' : '#2a2a2a'}`,
                color: timerTotal === s ? '#e8ff47' : '#555',
                borderRadius: 8, padding: '7px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>
                {s < 120 ? `${s}s` : `${s / 60}min`}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div style={{ margin: '16px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div className="section-label">PROGRESO SESIÓN</div>
              <div className="font-bebas" style={{ fontSize: 20, color: '#e8ff47' }}>{pct}%</div>
            </div>
            <div style={{ background: '#111', borderRadius: 4, height: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#e8ff47', width: `${pct}%`, borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>

          {/* Main Exercises */}
          <div style={{ margin: '20px 20px 0' }}>
            <div className="section-label" style={{ marginBottom: 10 }}>EJERCICIOS PRINCIPALES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exercises.map((ex, i) => {
                const done = !!ds.completed[i];
                const isExpanded = !!expanded[i];
                return (
                  <div key={i} onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))} style={{
                    background: '#181818', border: '1.5px solid #2a2a2a', borderRadius: 14, padding: 14,
                    cursor: 'pointer', opacity: done ? 0.5 : 1, position: 'relative', overflow: 'hidden', transition: 'opacity 0.2s',
                  }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: done ? '#2a2a2a' : accent }} />
                    <div style={{ paddingLeft: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, paddingRight: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#f2f0ea' }}>{ex.name}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, background: `${accent}18`, color: `${accent}bb`, borderRadius: 5, padding: '2px 7px' }}>{ex.sets} series</span>
                          <span style={{ fontSize: 10, fontWeight: 700, background: `${accent}18`, color: `${accent}bb`, borderRadius: 5, padding: '2px 7px' }}>{ex.reps}</span>
                          {ds.weights[i] && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#888', borderRadius: 5, padding: '2px 7px' }}>{ds.weights[i]} kg</span>}
                          {ds.rirs[i] !== undefined && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: '#888', borderRadius: 5, padding: '2px 7px' }}>RIR {ds.rirs[i]}</span>}
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); toggleExercise(i); }} style={{
                        width: 30, height: 30, borderRadius: '50%',
                        border: `2px solid ${done ? '#555' : '#333'}`,
                        background: done ? '#555' : 'transparent',
                        color: done ? '#0a0a0a' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                      }}>✓</button>
                    </div>
                    {isExpanded && (
                      <div style={{ paddingLeft: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #222' }}>
                        <div style={{ fontSize: 12, color: '#777', lineHeight: 1.6, marginBottom: 12 }}>💡 {ex.tip}</div>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }} onClick={e => e.stopPropagation()}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: '#444', marginBottom: 4, textTransform: 'uppercase' }}>Peso utilizado (kg)</div>
                            <input
                              type="number"
                              inputMode="decimal"
                              placeholder="0"
                              value={ds.weights[i] || ''}
                              onChange={e => updateDs(prev => ({ ...prev, weights: { ...prev.weights, [i]: e.target.value } }))}
                              style={{ width: '100%', background: '#111', border: '1.5px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', fontSize: 18, fontWeight: 700, color: accent, outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: '#444', marginBottom: 4, textTransform: 'uppercase' }}>RIR</div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {[0, 1, 2, 3].map(r => (
                                <button key={r} onClick={() => updateDs(prev => ({ ...prev, rirs: { ...prev.rirs, [i]: r } }))} style={{
                                  width: 34, height: 34, borderRadius: 8,
                                  border: `1.5px solid ${ds.rirs[i] === r ? accent : '#2a2a2a'}`,
                                  background: ds.rirs[i] === r ? `${accent}18` : 'transparent',
                                  color: ds.rirs[i] === r ? accent : '#444',
                                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                }}>{r}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setVideoId(ex.videoId); setVideoTitle(ex.name); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1.5px solid #2a2a2a', color: '#555', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
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

          {/* Metabolic Finisher */}
          {plan.finisher && (
            <div style={{ margin: '16px 20px 0' }}>
              <div style={{
                background: ds.finisherDone ? 'rgba(255,107,53,0.02)' : 'rgba(255,107,53,0.07)',
                border: `1.5px solid ${ds.finisherDone ? '#2a2a2a' : 'rgba(255,107,53,0.35)'}`,
                borderRadius: 16, padding: 18, opacity: ds.finisherDone ? 0.55 : 1, transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ff6b35', letterSpacing: 0.5 }}>{plan.finisher.title}</div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 3 }}>{plan.finisher.sub}</div>
                  </div>
                  <button onClick={toggleFinisher} style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${ds.finisherDone ? '#555' : '#ff6b35'}`,
                    background: ds.finisherDone ? '#555' : 'rgba(255,107,53,0.1)',
                    color: ds.finisherDone ? '#0a0a0a' : '#ff6b35',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}>✓</button>
                </div>
                {plan.finisher.moves.map((move, mi) => (
                  <div key={mi} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '6px 0', borderBottom: mi < plan.finisher!.moves.length - 1 ? '1px solid rgba(255,107,53,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#ff6b35', fontSize: 11 }}>→</span>
                    {move}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Session */}
          <div style={{ padding: '24px 20px 0' }}>
            <button className="btn-primary" onClick={completeSession} disabled={pct < 100 || saving || sessionDone}
              style={{ background: sessionDone ? '#2a2a2a' : undefined, color: sessionDone ? '#555' : undefined }}>
              {saving ? 'GUARDANDO...' : sessionDone ? '✓ SESIÓN COMPLETADA' : 'COMPLETAR SESIÓN'}
            </button>
          </div>
        </>
      )}

      {/* Rest overlay */}
      {restActive && (
        <div onClick={skipRest} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>DESCANSANDO</div>
          <div className="font-bebas" style={{ fontSize: 110, lineHeight: 1, letterSpacing: -2, color: restRemaining <= 10 ? '#ff6b35' : '#e8ff47' }}>{restRemaining}</div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#555' }}>Descansá {timerTotal} segundos</div>
          <button onClick={e => { e.stopPropagation(); skipRest(); }} style={{ marginTop: 28, background: 'transparent', border: '1.5px solid #2a2a2a', color: '#555', borderRadius: 10, padding: '12px 28px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            SALTAR DESCANSO →
          </button>
        </div>
      )}

      {/* Video modal */}
      {videoId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="font-bebas" style={{ fontSize: 18, letterSpacing: 2 }}>{videoTitle}</div>
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
