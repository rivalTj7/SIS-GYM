export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql, getTodaySession, getWeeklySummary } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

const createSchema = z.object({
  day_key: z.string(),
  split_type: z.string(),
  mode: z.enum(['gym', 'casa']).default('gym'),
  session_date: z.string().optional(),
});

// GET /api/workouts?date=2024-01-15
export async function GET(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const summary = searchParams.get('summary');

  if (summary) {
    const data = await getWeeklySummary(auth.userId);
    return NextResponse.json({ summary: data });
  }

  const session = await getTodaySession(auth.userId, date);

  // Get last 30 sessions for streak
  const recent = await sql`
    SELECT session_date, completed, split_type, mode
    FROM workout_sessions
    WHERE user_id = ${auth.userId}
    ORDER BY session_date DESC
    LIMIT 30
  `;

  return NextResponse.json({ session, recent });
}

// POST /api/workouts
export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await req.json();
    const { day_key, split_type, mode, session_date } = createSchema.parse(body);
    const date = session_date || new Date().toISOString().slice(0, 10);

    // Upsert session for that date
    const rows = await sql`
      INSERT INTO workout_sessions (user_id, day_key, split_type, mode, session_date)
      VALUES (${auth.userId}, ${day_key}, ${split_type}, ${mode}, ${date})
      ON CONFLICT DO NOTHING
      RETURNING *
    `;

    if (rows.length === 0) {
      // Already exists, return existing
      const existing = await getTodaySession(auth.userId, date);
      return NextResponse.json({ session: existing });
    }

    return NextResponse.json({ session: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
