import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

// ── Helpers ────────────────────────────────────────────────
function calcTDEE(sex: string, age: number, weight_kg: number, height_cm: number, activity: string) {
  const bmr =
    sex === 'f'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
      : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  const factor = activity === 'sed' ? 1.2 : activity === 'hi' ? 1.75 : 1.55;
  return Math.round(bmr * factor);
}

function calcGoalKcal(tdee: number, goal: string) {
  if (goal === 'def') return tdee - 400;
  if (goal === 'vol') return tdee + 400;
  if (goal === 'agr') return tdee - 500;
  return tdee; // mant
}

// ── GET /api/nutrition?date=YYYY-MM-DD ─────────────────────
export async function GET(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  const foods = await sql`
    SELECT id, food_name, kcal, protein_g, carbs_g, fat_g, meal_type
    FROM food_logs
    WHERE user_id = ${auth.userId} AND logged_at = ${date}
    ORDER BY created_at ASC
  `;

  const totals = foods.reduce(
    (acc, f) => ({
      kcal:      acc.kcal      + Number(f.kcal),
      protein_g: acc.protein_g + Number(f.protein_g),
      carbs_g:   acc.carbs_g   + Number(f.carbs_g),
      fat_g:     acc.fat_g     + Number(f.fat_g),
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  return NextResponse.json({ foods, totals });
}

// ── POST /api/nutrition ────────────────────────────────────
// Body shape A — food log: { food_name, kcal, protein_g, carbs_g, fat_g, meal_type, logged_at? }
// Body shape B — profile:  { sex, age, weight_kg, height_cm, activity, goal }
export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await req.json();

  // ── Profile save ───────────────────────────────────────
  if ('sex' in body) {
    const { sex, age, weight_kg, height_cm, activity, goal } = body;
    if (!sex || !age || !weight_kg || !height_cm || !activity || !goal) {
      return NextResponse.json({ error: 'Faltan campos del perfil' }, { status: 400 });
    }

    const tdee     = calcTDEE(sex, Number(age), Number(weight_kg), Number(height_cm), activity);
    const goal_kcal = calcGoalKcal(tdee, goal);
    const goal_prot = Math.round(Number(weight_kg) * 2);
    const goal_carb = Math.round((goal_kcal - goal_prot * 4 - Math.round(Number(weight_kg) * 0.8) * 9) / 4);

    const rows = await sql`
      INSERT INTO user_profiles (user_id, sex, age, weight_kg, height_cm, activity, goal, tdee, goal_kcal, goal_prot, goal_carb)
      VALUES (${auth.userId}, ${sex}, ${Number(age)}, ${Number(weight_kg)}, ${Number(height_cm)}, ${activity}, ${goal}, ${tdee}, ${goal_kcal}, ${goal_prot}, ${goal_carb})
      ON CONFLICT (user_id) DO UPDATE SET
        sex = EXCLUDED.sex, age = EXCLUDED.age, weight_kg = EXCLUDED.weight_kg,
        height_cm = EXCLUDED.height_cm, activity = EXCLUDED.activity, goal = EXCLUDED.goal,
        tdee = EXCLUDED.tdee, goal_kcal = EXCLUDED.goal_kcal, goal_prot = EXCLUDED.goal_prot,
        goal_carb = EXCLUDED.goal_carb, updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({ profile: rows[0] });
  }

  // ── Food log save ──────────────────────────────────────
  const { food_name, kcal, protein_g = 0, carbs_g = 0, fat_g = 0, meal_type = 'snack', logged_at } = body;
  if (!food_name || kcal == null) {
    return NextResponse.json({ error: 'food_name y kcal son requeridos' }, { status: 400 });
  }

  const date = logged_at ?? new Date().toISOString().slice(0, 10);
  const rows = await sql`
    INSERT INTO food_logs (user_id, food_name, kcal, protein_g, carbs_g, fat_g, meal_type, logged_at)
    VALUES (${auth.userId}, ${food_name}, ${Number(kcal)}, ${Number(protein_g)}, ${Number(carbs_g)}, ${Number(fat_g)}, ${meal_type}, ${date})
    RETURNING id, food_name, kcal, protein_g, carbs_g, fat_g, meal_type, logged_at
  `;

  return NextResponse.json({ food: rows[0] }, { status: 201 });
}

// ── DELETE /api/nutrition?id=xxx ───────────────────────────
export async function DELETE(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  await sql`DELETE FROM food_logs WHERE id = ${id} AND user_id = ${auth.userId}`;
  return NextResponse.json({ ok: true });
}
