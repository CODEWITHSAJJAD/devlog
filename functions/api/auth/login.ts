import { eq, and } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { verifyPassword, signToken, createAuthCookie } from '../../utils/auth';
import { users } from '../../../db/schema';
import type { Env } from '../../env';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getDb(env.DB);

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.email, normalizedEmail), eq(users.isActive, true)))
      .get();

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = await signToken(user.id, user.email, env.JWT_SECRET);
    const safeUser = { id: user.id, name: user.name, email: user.email };

    return new Response(JSON.stringify({ success: true, data: safeUser }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createAuthCookie(token),
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
