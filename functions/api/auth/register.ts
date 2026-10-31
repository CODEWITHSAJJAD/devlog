import { eq } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { hashPassword, signToken, createAuthCookie } from '../../utils/auth';
import { users } from '../../../db/schema';
import type { Env } from '../../env';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };
    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Name, email, and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (confirmPassword !== undefined && confirmPassword !== password) {
      return new Response(JSON.stringify({ success: false, error: 'Passwords do not match' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getDb(env.DB);

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).get();
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: 'Email is already registered' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdBy: userId,
      updatedBy: userId,
      isActive: true,
    });

    const token = await signToken(userId, normalizedEmail, env.JWT_SECRET);
    const safeUser = { id: userId, name: name.trim(), email: normalizedEmail };

    return new Response(JSON.stringify({ success: true, data: safeUser }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createAuthCookie(token),
      },
    });
  } catch (err: any) {
    const detail = err.cause?.message || err.message || 'Internal server error';
    return new Response(JSON.stringify({ success: false, error: detail }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
