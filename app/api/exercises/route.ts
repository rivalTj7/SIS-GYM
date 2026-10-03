export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql, getPersonalRecords } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { calculateVolume } from '@/lib/utils';
import { e1rm, REP_CAP, type SessionSets } from '@/lib/training';

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

// GET — ?recent=1&name=A&name=B (últimas sesiones + mejor 1RM) · ?list=1 · ?prs=1 · ?name=X (curva)
export async function GET(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);

  if (searchParams.get('prs')) {
    const records = await getPersonalRecords(auth.userId);
    return NextResponse.json({ prs: records });
  }

  if (searchParams.get('list')) {
    const rows = await sql`
      SELECT es.exercise_name,
             COUNT(DISTINCT es.session_id)::INT AS sessions,
             MAX(CASE WHEN es.reps BETWEEN 1 AND ${REP_CAP} AND es.weight_kg > 0
                      THEN CASE WHEN es.reps = 1 THEN es.weight_kg ELSE es.weight_kg * (1 + es.reps / 30.0) END END) AS best_e1rm
      FROM exercise_sets es
      WHERE es.user_id = ${auth.userId}
      GROUP BY es.exercise_name
      ORDER BY MAX(es.created_at) DESC
    `;
    return NextResponse.json({
      exercises: rows.map(r => ({
        name: r.exercise_name as string,
        sessions: Number(r.sessions),
        best_e1rm: r.best_e1rm === null ? null : Math.round(Number(r.best_e1rm) * 10) / 10,
      })),
    });
  }

  if (searchParams.get('recent')) {
    const names = searchParams.getAll('name').filter(Boolean).slice(0, 30);
    if (names.length === 0) return NextResponse.json({ recent: {} });

    const [rows, bests] = await Promise.all([
      sql`
        SELECT * FROM (
          SELECT es.exercise_name, ws.session_date::text AS session_date, es.session_id,
                 es.set_number, es.weight_kg, es.reps, es.rir,
                 DENSE_RANK() OVER (PARTITION BY es.exercise_name ORDER BY ws.session_date DESC, es.session_id) AS rk
          FROM exercise_sets es
          JOIN workout_sessions ws ON ws.id = es.session_id
          WHERE es.user_id = ${auth.userId} AND es.exercise_name = ANY(${names}::text[])
        ) t
        WHERE rk <= 3
        ORDER BY exercise_name, rk, set_number
      `,
      sql`
        SELECT exercise_name,
               MAX(CASE WHEN reps = 1 THEN weight_kg ELSE weight_kg * (1 + reps / 30.0) END) AS best_e1rm
        FROM exercise_sets
        WHERE user_id = ${auth.userId} AND exercise_name = ANY(${names}::text[])
          AND reps BETWEEN 1 AND ${REP_CAP} AND weight_kg > 0
        GROUP BY exercise_name
      `,
    ]);

    const recent: Record<string, { sessions: SessionSets[]; best_e1rm: number | null }> = {};
    for (const n of names) recent[n] = { sessions: [], best_e1rm: null };

    const bySession = new Map<string, SessionSets>();
    for (const r of rows) {
      const key = `${r.exercise_name}|${r.session_id}`;
      let sess = bySession.get(key);
      if (!sess) {
        sess = { date: String(r.session_date), sets: [] };
        bySession.set(key, sess);
        recent[r.exercise_name as string].sessions.push(sess);
      }
      sess.sets.push({
        weight_kg: r.weight_kg === null ? null : Number(r.weight_kg),
        reps: r.reps === null ? null : Number(r.reps),
      });
    }
    for (const b of bests) {
      recent[b.exercise_name as string].best_e1rm = Math.round(Number(b.best_e1rm) * 10) / 10;
    }
    return NextResponse.json({ recent });
  }

  const exerciseName = searchParams.get('name');
  if (!exerciseName) {
    return NextResponse.json({ error: 'Falta el nombre del ejercicio' }, { status: 400 });
  }

  const rows = await sql`
    SELECT ws.session_date::text AS session_date, es.weight_kg, es.reps, es.is_pr
    FROM exercise_sets es
    JOIN workout_sessions ws ON ws.id = es.session_id
    WHERE es.user_id = ${auth.userId} AND es.exercise_name = ${exerciseName}
    ORDER BY ws.session_date ASC, es.set_number ASC
    LIMIT 500
  `;

  const byDate = new Map<string, typeof rows>();
  for (const row of rows) {
    const d = String(row.session_date);
    byDate.set(d, [...(byDate.get(d) ?? []), row]);
  }

  const history = [...byDate.entries()].map(([date, sets]) => {
    const logged = sets.map(s => ({
      weight_kg: s.weight_kg === null ? null : Number(s.weight_kg),
      reps: s.reps === null ? null : Number(s.reps),
    }));
    let top: { w: number; r: number; e: number } | null = null;
    for (const s of logged) {
      const e = e1rm(s.weight_kg, s.reps);
      if (e !== null && (!top || e > top.e)) top = { w: s.weight_kg as number, r: s.reps as number, e };
    }
    return {
      date,
      best_weight: top?.w ?? null,
      best_reps: top?.r ?? null,
      estimated_1rm: top?.e ?? null,
      volume: calculateVolume(logged),
      sets: sets.length,
      has_pr: sets.some(s => s.is_pr),
    };
  });

  return NextResponse.json({ history });
}
