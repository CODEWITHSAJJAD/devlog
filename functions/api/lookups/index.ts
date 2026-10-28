import { eq, and, asc } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { lookups } from '../../../db/schema';
import type { Env } from '../../env';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  try {
    const db = getDb(env.DB);
    const conditions = [eq(lookups.isActive, true)];

    if (category) {
      conditions.push(eq(lookups.category, category));
    }

    const data = await db
      .select()
      .from(lookups)
      .where(and(...conditions))
      .orderBy(asc(lookups.sortOrder))
      .all();

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch lookups' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
