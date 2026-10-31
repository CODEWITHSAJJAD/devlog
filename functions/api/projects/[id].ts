import { eq, and } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { normalizeToDate } from '../../utils/date';
import { projects, tasks } from '../../../db/schema';
import { getProjectCode } from '../../../shared/projectCode';
import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { env, data, params } = context;
  const projectId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const project = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, data.userId), eq(projects.isActive, true)))
      .get();

    if (!project) {
      return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pTasks = await db
      .select({
        id: tasks.id,
        statusId: tasks.statusId,
      })
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), eq(tasks.isActive, true)))
      .all();

    const totalTasks = pTasks.length;
    const doneTasks = pTasks.filter((t) => t.statusId === 'TASK_STAT_DONE').length;
    let progress = 0;
    if (totalTasks > 0) {
      const sum = pTasks.reduce((acc, t) => {
        const s = t.statusId.toUpperCase();
        if (s.includes('DONE')) return acc + 100;
        if (s.includes('TESTING') || s.includes('REVIEW')) return 80;
        if (s.includes('PROGRESS')) return 50;
        if (s.includes('TODO')) return 20;
        if (s.includes('BLOCKED')) return 20;
        return acc;
      }, 0);
      progress = Math.round(sum / totalTasks);
    } else if (project.statusId === 'PROJ_STAT_COMPLETED') {
      progress = 100;
    } else if (project.statusId === 'PROJ_STAT_ACTIVE') {
      progress = 15;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...project,
          totalTasks,
          doneTasks,
          progress,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPut: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { request, env, data, params } = context;
  const projectId = params.id as string;

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
      statusId?: string;
      priorityId?: string;
      dueDate?: number;
      completedAt?: number;
    };

    const db = getDb(env.DB);
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, data.userId), eq(projects.isActive, true)))
      .get();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates: Record<string, any> = {
      updatedBy: data.userId,
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      updates.title = body.title.trim();
      updates.code = getProjectCode(body.title.trim());
    }
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.statusId !== undefined) {
      updates.statusId = body.statusId;
      if (body.statusId === 'PROJ_STAT_COMPLETED' && !body.completedAt) {
        updates.completedAt = new Date();
      }
    }
    if (body.priorityId !== undefined) updates.priorityId = body.priorityId;
    if (body.dueDate !== undefined) updates.dueDate = normalizeToDate(body.dueDate);
    if (body.completedAt !== undefined) updates.completedAt = normalizeToDate(body.completedAt);

    await db
      .update(projects)
      .set(updates)
      .where(and(eq(projects.id, projectId), eq(projects.userId, data.userId)));

    return new Response(JSON.stringify({ success: true, message: 'Project updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to update project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestDelete: PagesFunction<Env, 'id', EventContextData> = async (context) => {
  const { env, data, params } = context;
  const projectId = params.id as string;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, data.userId), eq(projects.isActive, true)))
      .get();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Soft-delete
    await db
      .update(projects)
      .set({ isActive: false, updatedBy: data.userId, updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), eq(projects.userId, data.userId)));

    return new Response(JSON.stringify({ success: true, message: 'Project soft-deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to delete project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
