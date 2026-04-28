import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// ── Typed query helpers ────────────────────────────────────
export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  sex: 'm' | 'f';
  age: number;
  weight_kg: number;
  height_cm: number;
  activity: 'sed' | 'med' | 'hi';
  goal: 'def' | 'mant' | 'vol' | 'agr';
  tdee: number;
  goal_kcal: number;
  goal_prot: number;
  goal_carb: number;
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  day_key: string;
  split_type: string;
  mode: 'gym' | 'casa';
  completed: boolean;
  duration_min: number | null;
  notes: string | null;
  session_date: string;
  created_at: string;
};

export type ExerciseSet = {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  rir: number | null;
  rpe: number | null;
  duration_sec: number | null;
  is_pr: boolean;
  created_at: string;
};

export type FoodLog = {
  id: string;
  user_id: string;
  food_name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  logged_at: string;
};

export type WeightLog = {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
  notes: string | null;
};

// ── Query functions ────────────────────────────────────────
export async function getUserByEmail(email: string) {
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  return rows[0] as (User & { password: string }) | undefined;
}

export async function getUserById(id: string) {
  const rows = await sql`SELECT id, email, name, created_at FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] as User | undefined;
}

export async function getProfile(userId: string) {
  const rows = await sql`SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1`;
  return rows[0] as UserProfile | undefined;
}

export async function getWeightLogs(userId: string, days = 30) {
  return await sql`
    SELECT * FROM weight_logs 
    WHERE user_id = ${userId} 
    AND logged_at >= CURRENT_DATE - ${days}::INT
    ORDER BY logged_at DESC
  ` as WeightLog[];
}

export async function getFoodLogs(userId: string, date: string) {
  return await sql`
    SELECT * FROM food_logs 
    WHERE user_id = ${userId} AND logged_at = ${date}
    ORDER BY created_at ASC
  ` as FoodLog[];
}

export async function getTodaySession(userId: string, date: string) {
  const rows = await sql`
    SELECT * FROM workout_sessions 
    WHERE user_id = ${userId} AND session_date = ${date}
    ORDER BY created_at DESC LIMIT 1
  `;
  return rows[0] as WorkoutSession | undefined;
}

export async function getSessionSets(sessionId: string) {
  return await sql`
    SELECT * FROM exercise_sets 
    WHERE session_id = ${sessionId}
    ORDER BY exercise_name, set_number
  ` as ExerciseSet[];
}

export async function getExerciseHistory(userId: string, exerciseName: string, limit = 10) {
  return await sql`
    SELECT es.*, ws.session_date
    FROM exercise_sets es
    JOIN workout_sessions ws ON ws.id = es.session_id
    WHERE es.user_id = ${userId} AND es.exercise_name = ${exerciseName}
    ORDER BY ws.session_date DESC, es.set_number ASC
    LIMIT ${limit}
  `;
}

export async function getWeeklySummary(userId: string) {
  return await sql`
    SELECT * FROM weekly_summary 
    WHERE user_id = ${userId}
    ORDER BY week_start DESC 
    LIMIT 8
  `;
}

export async function getPersonalRecords(userId: string) {
  return await sql`
    SELECT DISTINCT ON (exercise_name, reps)
      exercise_name, reps, weight_kg, created_at
    FROM exercise_sets
    WHERE user_id = ${userId} AND is_pr = TRUE
    ORDER BY exercise_name, reps, weight_kg DESC
  `;
}
