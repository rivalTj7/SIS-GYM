export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql, getFoodLogs } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { calculateTDEE, calculateGoalCalories, calculateMacros } from '@/lib/utils';

const profileSchema = z.object({
  sex: z.enum(['m', 'f']),
  age: z.number().int().min(15).max(80),
  weight_kg: z.number().min(40).max(200),
  height_cm: z.number().int().min(140).max(220),
  activity: z.enum(['sed', 'med', 'hi']),
  goal: z.enum(['def', 'mant', 'vol', 'agr']),
});

const foodSchema = z.object({
  food_name: z.string().min(1).max(100),
  kcal: z.number().int().positive(),
  protein_g: z.number().min(0).default(0),
  carbs_g: z.number().min(0).default(0),
  fat_g: z.number().min(0).default(0),
  meal_type: z.enum(['desayuno', 'almuerzo', 'cena', 'snack']).default('snack'),
  logged_at: z.string().optional(),
});

// GET /api/nutrition?date=2024-01-15
export async function GET(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  const [profileRows, foods] = await Promise.all([
    sql`SELECT * FROM user_profiles WHERE user_id = ${auth.userId} LIMIT 1`,
    getFoodLogs(auth.userId, date),
  ]);

  const profile = profileRows[0] || null;

  // Daily totals
  const totals = foods.reduce(
    (acc, f) => ({
      kcal: acc.kcal + Number(f.kcal),
      protein_g: acc.protein_g + Number(f.protein_g),
      carbs_g: acc.carbs_g + Number(f.carbs_g),
      fat_g: acc.fat_g + Number(f.fat_g),
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  return NextResponse.json({ profile, foods, totals, date });
}

// POST /api/nutrition — profile OR food log
export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await req.json();

  // If it has sex/age/weight etc → it's a profile update
  if (body.sex !== undefined) {
    try {
      const data = profileSchema.parse(body);
      const tdee = calculateTDEE(data.sex, data.age, data.weight_kg, data.height_cm, data.activity);
      const goalKcal = calculateGoalCalories(tdee, data.goal);
      const { protein, carbs } = calculateMacros(goalKcal, data.weight_kg);

      const rows = await sql`
        INSERT INTO user_profiles
          (user_id, sex, age, weight_kg, height_cm, activity, goal, tdee, goal_kcal, goal_prot, goal_carb)
        VALUES
          (${auth.userId}, ${data.sex}, ${data.age}, ${data.weight_kg},
           ${data.height_cm}, ${data.activity}, ${data.goal},
           ${tdee}, ${goalKcal}, ${protein}, ${carbs})
        ON CONFLICT (user_id) DO UPDATE SET
          sex = EXCLUDED.sex, age = EXCLUDED.age,
          weight_kg = EXCLUDED.weight_kg, height_cm = EXCLUDED.height_cm,
          activity = EXCLUDED.activity, goal = EXCLUDED.goal,
          tdee = EXCLUDED.tdee, goal_kcal = EXCLUDED.goal_kcal,
          goal_prot = EXCLUDED.goal_prot, goal_carb = EXCLUDED.goal_carb,
          updated_at = NOW()
        RETURNING *
      `;
      return NextResponse.json({ profile: rows[0] });
    } catch (err) {
      if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 });
      throw err;
    }
  }

  // Otherwise it's a food log entry
  try {
    const data = foodSchema.parse(body);
    const date = data.logged_at || new Date().toISOString().slice(0, 10);

    const rows = await sql`
      INSERT INTO food_logs
        (user_id, food_name, kcal, protein_g, carbs_g, fat_g, meal_type, logged_at)
      VALUES
        (${auth.userId}, ${data.food_name}, ${data.kcal}, ${data.protein_g},
         ${data.carbs_g}, ${data.fat_g}, ${data.meal_type}, ${date})
      RETURNING *
    `;
    return NextResponse.json({ food: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 });
    throw err;
  }
}

// DELETE /api/nutrition?id=uuid
export async function DELETE(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

  await sql`DELETE FROM food_logs WHERE id = ${id} AND user_id = ${auth.userId}`;
  return NextResponse.json({ ok: true });
}
