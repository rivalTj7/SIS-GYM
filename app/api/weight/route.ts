import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql, getWeightLogs } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

const logSchema = z.object({
  weight_kg: z.number().min(30).max(300),
  logged_at: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/weight?days=30
export async function GET(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');

  const logs = await getWeightLogs(auth.userId, days);

  // Calculate stats
  const weights = logs.map(l => Number(l.weight_kg));
  const stats = weights.length > 0 ? {
    current: weights[0],
    lowest: Math.min(...weights),
    highest: Math.max(...weights),
    change: weights.length > 1 ? +(weights[0] - weights[weights.length - 1]).toFixed(2) : 0,
    avg: +(weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2),
  } : null;

  return NextResponse.json({ logs, stats });
}

// POST /api/weight
export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await req.json();
    const { weight_kg, logged_at, notes } = logSchema.parse(body);
    const date = logged_at || new Date().toISOString().slice(0, 10);

    // Upsert for the same date
    const rows = await sql`
      INSERT INTO weight_logs (user_id, weight_kg, logged_at, notes)
      VALUES (${auth.userId}, ${weight_kg}, ${date}, ${notes ?? null})
      ON CONFLICT (user_id, logged_at) DO UPDATE
      SET weight_kg = EXCLUDED.weight_kg, notes = EXCLUDED.notes
      RETURNING *
    `;

    return NextResponse.json({ log: rows[0] }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE /api/weight?id=uuid
export async function DELETE(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

  await sql`DELETE FROM weight_logs WHERE id = ${id} AND user_id = ${auth.userId}`;
  return NextResponse.json({ ok: true });
}
