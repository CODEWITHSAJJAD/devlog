import { eq, and, asc, sql } from 'drizzle-orm';
import { getDb } from '../../utils/db';
import { normalizeToDate } from '../../utils/date';
import { tasks, projects } from '../../../db/schema';
import type { Env, EventContextData } from '../../env';

export const onRequestGet: PagesFunction<Env, any, EventContextData> = async (context) => {
  const { request, env, data } = context;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDb(env.DB);
    const conditions = [eq(tasks.userId, data.userId), eq(tasks.isActive, true)];

    if (projectId) {
      // Validate project access
      const validProject = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.userId, data.userId), eq(projects.isActive, true)))
        .get();

      if (!validProject) {
        return new Response(JSON.stringify({ success: false, error: 'Project not found or unauthorized' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      conditions.push(eq(tasks.projectId, projectId));
    }

    const taskList = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.position), asc(tasks.createdAt))
      .all();

    return new Response(JSON.stringify({ success: true, data: taskList }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to fetch tasks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPost: PagesFunction<Env, any, EventContextData> = async (context) => {
  const { request, env, data } = context;

  if (!data.userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      projectId?: string;
      title?: string;
      description?: string;
      typeId?: string;
      statusId?: string;
      priorityId?: string;
      dueDate?: number;
      position?: number;
    };

    if (!body.projectId || !body.title || !body.title.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Project ID and title are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(env.DB);

    // Verify project belongs to user and is active
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, body.projectId), eq(projects.userId, data.userId), eq(projects.isActive, true)))
      .get();

    if (!project) {
      return new Response(JSON.stringify({ success: false, error: 'Project not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const statusId = body.statusId || 'TASK_STAT_BACKLOG';
    const priorityId = body.priorityId || 'PRIO_MEDIUM';
    const typeId = body.typeId || 'TASK_TYPE_FEATURE';

    // Auto-calculate next position if not specified
    let position = body.position;
    if (position === undefined) {
      const maxPos = await db
        .select({ max: sql<number>`COALESCE(MAX(${tasks.position}), 0)` })
        .from(tasks)
        .where(
          and(
            eq(tasks.projectId, body.projectId),
            eq(tasks.statusId, statusId),
            eq(tasks.isActive, true)
          )
        )
        .get();
      position = (maxPos?.max ?? 0) + 1;
    }

    const taskId = crypto.randomUUID();
    const newTask = {
      id: taskId,
      projectId: body.projectId,
      userId: data.userId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      typeId,
      statusId,
      priorityId,
      position,
      dueDate: normalizeToDate(body.dueDate),
      completedAt: statusId === 'TASK_STAT_DONE' ? new Date() : null,
      createdBy: data.userId,
      updatedBy: data.userId,
      isActive: true,
    };

    await db.insert(tasks).values(newTask);

    return new Response(JSON.stringify({ success: true, data: newTask }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Failed to create task' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
