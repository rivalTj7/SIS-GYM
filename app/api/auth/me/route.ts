import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { getUserById, getProfile } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const user = await getUserById(auth.userId);
  const profile = await getProfile(auth.userId);

  return NextResponse.json({ user, profile });
}
