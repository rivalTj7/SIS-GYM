// Lógica pura de entrenamiento: 1RM estimado y progresión doble.
// Todo se deriva del historial; no se guardan contadores que puedan desincronizarse.

export const REP_CAP = 12;

export type LoggedSet = { weight_kg: number | null; reps: number | null };
export type SessionSets = { date: string; sets: LoggedSet[] };

export type Suggestion = {
  weight: number | null;
  reps: number | null;
  action: 'first' | 'up' | 'reps' | 'repeat' | 'deload';
  reason: string;
};

// Epley. Sobre REP_CAP reps la estimación deja de ser confiable → null.
export function e1rm(weight: number | null | undefined, reps: number | null | undefined): number | null {
  const w = Number(weight);
  const r = Number(reps);
  if (!isFinite(w) || !isFinite(r) || w <= 0 || r < 1 || r > REP_CAP) return null;
  const est = r === 1 ? w : w * (1 + r / 30);
  return Math.round(est * 10) / 10;
}

export function bestE1rm(sets: LoggedSet[]): number | null {
  let best: number | null = null;
  for (const s of sets) {
    const v = e1rm(s.weight_kg, s.reps);
    if (v !== null && (best === null || v > best)) best = v;
  }
  return best;
}

// "8–10" → {min 8, max 10}; "12" → {12,12}; "12 c/brazo" → {12,12}; "60s + 20 reps" → null
export function parseRepRange(text: string): { min: number; max: number } | null {
  if (/\d\s*s\b/i.test(text) || /seg/i.test(text)) return null;
  const range = text.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const single = text.match(/^\s*(\d+)/);
  if (single) return { min: Number(single[1]), max: Number(single[1]) };
  return null;
}

// Rangos de fuerza (≤12 reps) suben 2.5 kg; rangos altos (aislamiento) 1.25 kg.
export function loadStep(range: { min: number; max: number }): number {
  return range.max <= 12 ? 2.5 : 1.25;
}

function snap(v: number, step: number): number {
  return Math.round(Math.round(v / step) * step * 100) / 100;
}

// Baja ~10 % y cae en un peso cargable; nunca queda igual ni por debajo de un paso.
function deloadTo(cur: number, step: number): number {
  let next = snap(cur * 0.9, step);
  if (next >= cur) next = snap(cur - step, step);
  return Math.max(step, next);
}

type Judged = { weight: number | null; hit: boolean; allInRange: boolean; lowReps: number; hasReps: boolean; count: number };

function judge(session: SessionSets, planned: number, range: { min: number; max: number }): Judged {
  const done = session.sets.filter(s => s.weight_kg !== null || s.reps !== null);
  const weights = done.map(s => Number(s.weight_kg)).filter(w => w > 0);
  const weight = weights.length ? Math.max(...weights) : null;
  const reps = done.map(s => (s.reps === null ? null : Number(s.reps)));
  const hasReps = reps.length > 0 && reps.every(r => r !== null);
  if (!hasReps) return { weight, hit: false, allInRange: false, lowReps: 0, hasReps: false, count: done.length };
  const nums = reps as number[];
  const enough = nums.length >= planned;
  return {
    weight,
    hit: enough && nums.every(r => r >= range.max),
    allInRange: enough && nums.every(r => r >= range.min),
    lowReps: Math.min(...nums),
    hasReps: true,
    count: nums.length,
  };
}

// history: sesiones más recientes primero.
export function suggestNext(history: SessionSets[], plannedSets: number, repsText: string): Suggestion | null {
  const range = parseRepRange(repsText);
  if (!range || history.length === 0) return null;

  const last = judge(history[0], plannedSets, range);
  if (last.weight === null) return null;
  const step = loadStep(range);

  if (!last.hasReps) {
    return { weight: last.weight, reps: range.min, action: 'repeat', reason: `Última vez usaste ${last.weight} kg (sin reps registradas). Repetí ese peso.` };
  }

  if (last.hit) {
    const w = Math.round((last.weight + step) * 100) / 100;
    return { weight: w, reps: range.min, action: 'up', reason: `Completaste ${range.max} reps en todas las series con ${last.weight} kg → sube a ${w} kg (+${step}).` };
  }

  if (last.count < plannedSets) {
    return { weight: last.weight, reps: range.min, action: 'repeat', reason: `Hiciste ${last.count} de ${plannedSets} series con ${last.weight} kg. Completá todas las series para progresar.` };
  }

  // Deload tras 3 sesiones seguidas fallando el mínimo del rango con el mismo peso.
  const recent = history.slice(0, 3).map(h => judge(h, plannedSets, range));
  const sameWeight = recent.every(j => j.weight === last.weight);
  if (recent.length === 3 && sameWeight && recent.every(j => j.hasReps && !j.allInRange)) {
    const w = deloadTo(last.weight, step);
    return { weight: w, reps: range.min, action: 'deload', reason: `3 sesiones sin llegar a ${range.min} reps con ${last.weight} kg → descarga a ${w} kg (-10 %) y reconstruí.` };
  }

  if (last.allInRange) {
    const target = Math.min(last.lowReps + 1, range.max);
    return { weight: last.weight, reps: target, action: 'reps', reason: `Mismo peso (${last.weight} kg): buscá ${target} reps por serie hasta llegar a ${range.max}.` };
  }

  return { weight: last.weight, reps: range.min, action: 'repeat', reason: `No llegaste a ${range.min} reps en todas las series con ${last.weight} kg. Repetí el peso.` };
}
