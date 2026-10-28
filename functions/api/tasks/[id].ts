import { eq, and } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { normalizeToDate } from '../../utils/date';
import { tasks } from '../../../db/schema';
import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { env, data, params } = context;
  const taskId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const task = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, data.userId), eq(tasks.isActive, true)))
      .get();

    if (!task) {
      return new Response(JSON.stringify({ success: false, error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: task }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPut: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { request, env, data, params } = context;
  const taskId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      typeId?: string;
      statusId?: string;
      priorityId?: string;
      position?: number;
      dueDate?: number;
      completedAt?: number | null;
    };

    const db = getDb(env.DB);
    const existing = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, data.userId), eq(tasks.isActive, true)))
      .get();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates: Record<string, any> = {
      updatedBy: data.userId,
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.typeId !== undefined) updates.typeId = body.typeId;
    if (body.priorityId !== undefined) updates.priorityId = body.priorityId;
    if (body.position !== undefined) updates.position = body.position;
    if (body.dueDate !== undefined) updates.dueDate = normalizeToDate(body.dueDate);
    if (body.completedAt !== undefined) updates.completedAt = normalizeToDate(body.completedAt);

    if (body.statusId !== undefined) {
      updates.statusId = body.statusId;
      if (body.statusId === 'TASK_STAT_DONE' && existing.statusId !== 'TASK_STAT_DONE') {
        updates.completedAt = new Date();
      } else if (body.statusId !== 'TASK_STAT_DONE' && existing.statusId === 'TASK_STAT_DONE') {
        updates.completedAt = null;
      }
    }

    if (body.completedAt !== undefined) {
      updates.completedAt = body.completedAt ? new Date(body.completedAt * 1000) : null;
    }

    await db
      .update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, data.userId)));

    return new Response(JSON.stringify({ success: true, message: 'Task updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to update task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestDelete: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { env, data, params } = context;
  const taskId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const existing = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, data.userId), eq(tasks.isActive, true)))
      .get();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Soft-delete
    await db
      .update(tasks)
      .set({ isActive: false, updatedBy: data.userId, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, data.userId)));

    return new Response(JSON.stringify({ success: true, message: 'Task soft-deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to delete task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
