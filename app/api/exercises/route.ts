export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql, getExerciseHistory, getPersonalRecords } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { estimate1RM, calculateVolume } from '@/lib/utils';

const setSchema = z.object({
  session_id: z.string().uuid(),
  exercise_name: z.string().min(1),
  set_number: z.number().int().positive(),
  weight_kg: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  rir: z.number().int().min(0).max(4).nullable().optional(),
  rpe: z.number().min(6).max(10).nullable().optional(),
  duration_sec: z.number().int().nullable().optional(),
});

const bulkSchema = z.object({
  sets: z.array(setSchema),
});

// POST — log a set or bulk sets
export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await req.json();

    // Support both single set and bulk
    const payload = body.sets ? bulkSchema.parse(body) : { sets: [setSchema.parse(body)] };

    const inserted = [];
    for (const s of payload.sets) {
      const rows = await sql`
        INSERT INTO exercise_sets
          (session_id, user_id, exercise_name, set_number, weight_kg, reps, rir, rpe, duration_sec)
        VALUES
          (${s.session_id}, ${auth.userId}, ${s.exercise_name}, ${s.set_number},
           ${s.weight_kg ?? null}, ${s.reps ?? null}, ${s.rir ?? null},
           ${s.rpe ?? null}, ${s.duration_sec ?? null})
        RETURNING *
      `;
      inserted.push(rows[0]);
    }

    return NextResponse.json({ sets: inserted }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET — history for an exercise or all PRs
export async function GET(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const exerciseName = searchParams.get('name');
  const prs = searchParams.get('prs');

  if (prs) {
    const records = await getPersonalRecords(auth.userId);
    return NextResponse.json({ prs: records });
  }

  if (!exerciseName) {
    return NextResponse.json({ error: 'Falta el nombre del ejercicio' }, { status: 400 });
  }

  const history = await getExerciseHistory(auth.userId, exerciseName);

  // Group by session_date and calculate 1RM + volume
  const byDate = history.reduce((acc: Record<string, typeof history>, row) => {
    const date = row.session_date as string;
    if (!acc[date]) acc[date] = [];
    acc[date].push(row);
    return acc;
  }, {});

  const chartData = Object.entries(byDate).map(([date, sets]) => {
    const maxSet = sets.reduce((best, s) => {
      if (!s.weight_kg || !s.reps) return best;
      const orm = estimate1RM(Number(s.weight_kg), Number(s.reps));
      return orm > (best?.orm ?? 0) ? { ...s, orm } : best;
    }, null as (typeof sets[0] & { orm: number }) | null);

    return {
      date,
      best_weight: maxSet?.weight_kg ?? null,
      best_reps: maxSet?.reps ?? null,
      estimated_1rm: maxSet?.orm ?? null,
      volume: calculateVolume(sets.map(s => ({
        weight_kg: s.weight_kg ? Number(s.weight_kg) : null,
        reps: s.reps ? Number(s.reps) : null,
      }))),
      sets: sets.length,
      has_pr: sets.some(s => s.is_pr),
    };
  });

  return NextResponse.json({ history: chartData, raw: history });
}
