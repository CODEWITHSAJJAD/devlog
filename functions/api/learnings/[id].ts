import { eq, and } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { learnings } from '../../../db/schema';
import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { env, data, params } = context;
  const learningId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const learning = await db
      .select()
      .from(learnings)
      .where(and(eq(learnings.id, learningId), eq(learnings.userId, data.userId), eq(learnings.isActive, true)))
      .get();

    if (!learning) {
      return new Response(JSON.stringify({ success: false, error: 'Learning not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: learning }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch learning' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPut: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { request, env, data, params } = context;
  const learningId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      tags?: string[];
    };

    const db = getDb(env.DB);
    const existing = await db
      .select({ id: learnings.id })
      .from(learnings)
      .where(and(eq(learnings.id, learningId), eq(learnings.userId, data.userId), eq(learnings.isActive, true)))
      .get();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Learning not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates: Record<string, any> = {
      updatedBy: data.userId,
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.content !== undefined) updates.content = body.content.trim();
    if (body.tags !== undefined) {
      updates.tags = Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : [];
    }

    await db
      .update(learnings)
      .set(updates)
      .where(and(eq(learnings.id, learningId), eq(learnings.userId, data.userId)));

    return new Response(JSON.stringify({ success: true, message: 'Learning updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to update learning' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestDelete: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { env, data, params } = context;
  const learningId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const existing = await db
      .select({ id: learnings.id })
      .from(learnings)
      .where(and(eq(learnings.id, learningId), eq(learnings.userId, data.userId), eq(learnings.isActive, true)))
      .get();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Learning not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Soft-delete
    await db
      .update(learnings)
      .set({ isActive: false, updatedBy: data.userId, updatedAt: new Date() })
      .where(and(eq(learnings.id, learningId), eq(learnings.userId, data.userId)));

    return new Response(JSON.stringify({ success: true, message: 'Learning soft-deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to delete learning' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
