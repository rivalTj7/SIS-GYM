export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sql, getUserByEmail } from '@/lib/db';
import { signToken, createAuthCookie } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = schema.parse(body);

    // Check if exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const rows = await sql`
      INSERT INTO users (email, name, password)
      VALUES (${email}, ${name}, ${hashed})
      RETURNING id, email, name, created_at
    `;

    const user = rows[0];
    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    const cookie = createAuthCookie(token);

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(cookie);
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
