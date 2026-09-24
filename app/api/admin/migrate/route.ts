export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || authHeader !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Add body composition columns if missing
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS body_fat_pct  NUMERIC(4,2)`;
    results.push('body_fat_pct OK');
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS muscle_kg     NUMERIC(5,2)`;
    results.push('muscle_kg OK');
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bone_kg       NUMERIC(4,2)`;
    results.push('bone_kg OK');
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS water_pct     NUMERIC(4,2)`;
    results.push('water_pct OK');
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS visceral_fat  NUMERIC(4,2)`;
    results.push('visceral_fat OK');
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS metabolic_age INT`;
    results.push('metabolic_age OK');

    // Add unique constraint for ON CONFLICT
    await sql`ALTER TABLE user_profiles ADD CONSTRAINT IF NOT EXISTS uq_profile_user UNIQUE (user_id)`;
    results.push('uq_profile_user constraint OK');

    // Add unique constraint for weight_logs
    await sql`ALTER TABLE weight_logs ADD CONSTRAINT IF NOT EXISTS uq_weight_user_date UNIQUE (user_id, logged_at)`;
    results.push('uq_weight_user_date constraint OK');

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message, results }, { status: 500 });
  }
}
