import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';

const patchSchema = z.object({
  completed: z.boolean().optional(),
  duration_min: z.number().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const updates = patchSchema.parse(body);

    const rows = await sql`
      UPDATE workout_sessions
      SET
        completed    = COALESCE(${updates.completed ?? null}, completed),
        duration_min = COALESCE(${updates.duration_min ?? null}, duration_min),
        notes        = COALESCE(${updates.notes ?? null}, notes)
      WHERE id = ${id} AND user_id = ${auth.userId}
      RETURNING *
    `;

    if (!rows[0]) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ session: rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET sets for a session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;

  const sets = await sql`
    SELECT es.* FROM exercise_sets es
    JOIN workout_sessions ws ON ws.id = es.session_id
    WHERE es.session_id = ${id} AND ws.user_id = ${auth.userId}
    ORDER BY exercise_name, set_number
  `;

  return NextResponse.json({ sets });
}
