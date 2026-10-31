import { eq, and } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { normalizeToDate } from '../../utils/date';
import { sprints, tasks } from '../../../db/schema';
import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { env, data, params } = context;
  const sprintId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const sprint = await db
      .select()
      .from(sprints)
      .where(and(eq(sprints.id, sprintId), eq(sprints.userId, data.userId), eq(sprints.isActive, true)))
      .get();

    if (!sprint) {
      return new Response(JSON.stringify({ success: false, error: 'Sprint not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: sprint }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch sprint' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPut: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { request, env, data, params } = context;
  const sprintId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      version?: string | null;
      goal?: string | null;
      status?: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
      startDate?: number | null;
      endDate?: number | null;
    };

    const db = getDb(env.DB);
    const existing = await db
      .select()
      .from(sprints)
      .where(and(eq(sprints.id, sprintId), eq(sprints.userId, data.userId), eq(sprints.isActive, true)))
      .get();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Sprint not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates: Record<string, any> = {
      updatedBy: data.userId,
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.version !== undefined) updates.version = body.version?.trim() || null;
    if (body.goal !== undefined) updates.goal = body.goal?.trim() || null;
    if (body.status !== undefined) updates.status = body.status;
    if (body.startDate !== undefined) updates.startDate = normalizeToDate(body.startDate);
    if (body.endDate !== undefined) updates.endDate = normalizeToDate(body.endDate);

    await db
      .update(sprints)
      .set(updates)
      .where(and(eq(sprints.id, sprintId), eq(sprints.userId, data.userId)));

    return new Response(JSON.stringify({ success: true, message: 'Sprint updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to update sprint' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestDelete: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { env, data, params } = context;
  const sprintId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const existing = await db
      .select({ id: sprints.id })
      .from(sprints)
      .where(and(eq(sprints.id, sprintId), eq(sprints.userId, data.userId), eq(sprints.isActive, true)))
      .get();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Sprint not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Soft delete the sprint
    await db
      .update(sprints)
      .set({ isActive: false, updatedBy: data.userId, updatedAt: new Date() })
      .where(and(eq(sprints.id, sprintId), eq(sprints.userId, data.userId)));

    // Unassign tasks from this sprint so they return to Backlog
    await db
      .update(tasks)
      .set({ sprintId: null, updatedBy: data.userId, updatedAt: new Date() })
      .where(and(eq(tasks.sprintId, sprintId), eq(tasks.userId, data.userId)));

    return new Response(JSON.stringify({ success: true, message: 'Sprint deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to delete sprint' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
