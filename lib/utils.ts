export type ActivityLevel = 'sed' | 'med' | 'hi';
export type Goal = 'def' | 'mant' | 'vol' | 'agr';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sed: 1.2,
  med: 1.55,
  hi: 1.725,
};

// 'mant' = recomposición corporal: ligero déficit de -200 kcal
// La síntesis muscular requiere un déficit pequeño, no cero
const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  def: -400,
  mant: -200,
  vol: +350,
  agr: -500,
};

export function calculateTDEE(
  sex: 'm' | 'f',
  age: number,
  weightKg: number,
  heightCm: number,
  activity: ActivityLevel
): number {
  // Mifflin-St Jeor (más preciso para adultos con exceso de grasa)
  let bmr: number;
  if (sex === 'm') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

export function calculateGoalCalories(tdee: number, goal: Goal): number {
  return tdee + GOAL_ADJUSTMENTS[goal];
}

export function calculateMacros(goalKcal: number, weightKg: number) {
  // Proteína: 2.2g × kg de peso total (cubre 2.7g por kg de masa magra aprox.)
  const protein = Math.round(weightKg * 2.2);
  // Grasa: 28% de las calorías totales (hormonas + saciedad)
  const fat = Math.round((goalKcal * 0.28) / 9);
  // Carbos: el resto (combustible para los entrenamientos)
  const carbsKcal = goalKcal - protein * 4 - fat * 9;
  const carbs = Math.max(50, Math.round(carbsKcal / 4));
  return { protein, fat, carbs };
}

export function getGoalLabel(goal: Goal): string {
  const labels: Record<Goal, string> = {
    def:  'Quemar grasa (déficit –400 kcal)',
    mant: 'Recomposición corporal (–200 kcal)',
    vol:  'Ganar músculo (superávit +350 kcal)',
    agr:  'Déficit agresivo (–500 kcal)',
  };
  return labels[goal];
}

// 1RM estimado (Epley formula)
export function estimate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// Volumen de entrenamiento = sets × reps × weight
export function calculateVolume(sets: Array<{ weight_kg: number | null; reps: number | null }>) {
  return sets.reduce((total, set) => {
    if (set.weight_kg && set.reps) {
      return total + set.weight_kg * set.reps;
    }
    return total;
  }, 0);
}
